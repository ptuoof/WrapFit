import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

export const TEST_PASSWORD = 'Passw0rd123';

/** `wf_access=...` pair of a Set-Cookie header, ready for a `Cookie` request header. */
export const accessCookie = (setCookie: string[]) =>
  setCookie.find((line) => line.startsWith('wf_access='))!.split(';')[0];

/**
 * A signed-in account for tests: registers, marks the email verified directly in the database (the emailed link
 * itself is covered by auth.e2e-spec.ts), then signs in with the password.
 */
export async function signUp(
  app: INestApplication,
  email: string,
  fullName?: string,
): Promise<{ id: string; cookie: string; setCookie: string[] }> {
  const api = () => request(app.getHttpServer());
  const registered = await api().post('/api/auth/register').send({ email, password: TEST_PASSWORD, fullName }).expect(201);
  const id = registered.body.user.id as string;
  await app.get(PrismaService).user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });

  const login = await api().post('/api/auth/login').send({ email, password: TEST_PASSWORD }).expect(200);
  const setCookie = login.headers['set-cookie'] as unknown as string[];
  return { id, cookie: accessCookie(setCookie), setCookie };
}
