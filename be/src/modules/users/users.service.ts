import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { paginate, Paginated, PaginationQueryDto, toSkipTake } from '../../common/dto/pagination.dto';
import { GoogleProfile } from '../../common/interfaces/auth.interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SafeUser, userSelect } from './user.select';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Internal use only (auth): returns the full row including the password hash. */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    fullName?: string;
    role?: Role;
  }): Promise<SafeUser> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role,
      },
      select: userSelect,
    });
  }

  /** Internal use only (auth). */
  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  /**
   * Attaches a Google identity to an existing account; keeps the profile fields the user already set. Google proved
   * the email, so the account becomes verified.
   *
   * An account whose password was set before anyone proved the email may belong to someone who registered this
   * address first to wait for its owner (pre-account takeover): its password is removed and its sessions revoked, so
   * only the owner of the Google account keeps access. They can set a password again with "forgot password".
   */
  linkGoogleAccount(user: User, profile: GoogleProfile): Promise<User> {
    const unprovenPassword = user.passwordHash !== null && user.emailVerifiedAt === null;
    return this.prisma.$transaction(async (tx) => {
      if (unprovenPassword) {
        const { count } = await tx.refreshToken.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.logger.warn(
          `auth.google_link_cleared_unverified_password userId=${user.id} sessionsRevoked=${count}`,
        );
      }
      return tx.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          fullName: user.fullName ?? profile.fullName,
          avatarUrl: user.avatarUrl ?? profile.avatarUrl,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          ...(unprovenPassword && { passwordHash: null }),
        },
      });
    });
  }

  /** Creates a Google-only account (no password); Google only hands out verified emails here. */
  createFromGoogle(profile: GoogleProfile): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: profile.email,
        emailVerifiedAt: new Date(),
        googleId: profile.googleId,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<SafeUser>> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.user.count(),
    ]);
    return paginate(items, total, query);
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateProfile(id: string, dto: UpdateProfileDto): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data: { fullName: dto.fullName, shopName: dto.shopName, avatarUrl: dto.avatarUrl },
      select: userSelect,
    });
  }

  /** Replaces the whole brand kit; an empty slogan is stored as null. */
  updateBrandKit(id: string, dto: UpdateBrandKitDto): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data: { brandKit: { logoUrl: dto.logoUrl, colors: dto.colors, fonts: dto.fonts, slogan: dto.slogan || null } },
      select: userSelect,
    });
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto, actorId: string): Promise<SafeUser> {
    if (id === actorId && (dto.role !== undefined || dto.isActive === false)) {
      throw new BadRequestException('You cannot change your own role or deactivate yourself');
    }

    const data: Prisma.UserUpdateInput = { role: dto.role, isActive: dto.isActive };

    if (dto.isActive === false) {
      // Deactivated users must lose all existing sessions.
      const [user] = await this.prisma.$transaction([
        this.prisma.user.update({ where: { id }, data, select: userSelect }),
        this.prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);
      return user;
    }

    return this.prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async remove(id: string, actorId: string): Promise<void> {
    if (id === actorId) throw new BadRequestException('You cannot delete yourself');
    const keys = await this.storage.listUserFiles(id);
    await this.prisma.user.delete({ where: { id } });
    await this.storage.deleteObjects(keys);
  }
}
