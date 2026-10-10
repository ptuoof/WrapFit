import { Prisma, PrismaClient, Role, SubscriptionTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Kích thước tối thiểu (mm) khớp với IT1-02: L >= 40, W >= 30, H >= 20.
const dimensionParams = {
  length: { unit: 'mm', min: 40, max: 600 },
  width: { unit: 'mm', min: 30, max: 600 },
  height: { unit: 'mm', min: 20, max: 600 },
  paperThickness: { unit: 'mm', min: 0.2, max: 1.5 },
};

const boxTemplates: Prisma.BoxTemplateCreateInput[] = [
  {
    id: 'tuck-top',
    name: 'Hộp Nắp Gài Đáy Khóa',
    category: 'retail',
    description: 'Hộp gài nắp trên, đáy khóa cài — phổ biến cho mỹ phẩm, nến thơm.',
    formulaSchema: { generator: 'generateTuckTopDieline', params: dimensionParams },
  },
  {
    id: 'sleeve-drawer',
    name: 'Hộp Kéo Bao Diêm',
    category: 'luxury',
    description: 'Phôi 2 mảnh: vỏ ngoài và khay kéo, dung sai trượt 2t + 0.5mm.',
    formulaSchema: { generator: 'generateSleeveDrawerDieline', params: dimensionParams },
  },
  {
    id: 'lid-base',
    name: 'Hộp Âm Dương',
    category: 'luxury',
    description: 'Phôi 2 mảnh: nắp bao khít đáy, mép cuốn bảo vệ.',
    formulaSchema: { generator: 'generateLidBaseDieline', params: dimensionParams },
  },
  {
    id: 'pillow',
    name: 'Hộp Gối Bầu Cong',
    category: 'accessories',
    description: 'Thân hộp elip với nếp cấn cong Bezier, hợp cho trang sức, phụ kiện nhỏ.',
    formulaSchema: { generator: 'generatePillowDieline', params: dimensionParams },
  },
];

/** A text element on the front panel (CanvasElement from @wrapfit/shared). */
const text = (id: string, content: string, y: number, fontSize: number, color: string) => ({
  id,
  type: 'text',
  panelId: 'front',
  x: 8,
  y,
  width: 60,
  height: fontSize * 0.6,
  rotation: 0,
  content,
  style: { fontFamily: 'Playfair Display', fontSize, color },
});

// "WrapFit Curated" designs of the template hub (UC-12). Fixed ids so the seed can run on every start.
const designTemplates: Prisma.DesignTemplateUncheckedCreateInput[] = [
  {
    id: '6f1c2a80-0001-4c3e-9a51-7d0e5a1f0001',
    boxTemplateId: 'tuck-top',
    title: 'Hộp Nến Tết Lộc Xuân',
    description: 'Nắp gài đáy khóa giấy kraft, chữ đỏ son cho nến thơm mùa Tết.',
    occasion: 'TET',
    industry: 'CANDLES',
    dimensions: { length: 90, width: 90, height: 110, paperThickness: 0.4 },
    materialSpec: { type: 'kraft', gsm: 300, caliper: 0.4, finish: 'matte' },
    canvasState: { elements: [text('title', 'Lộc Xuân', 20, 18, '#C0392B'), text('note', 'Nến thơm thủ công', 40, 9, '#2B1E16')] },
    tags: ['tet', 'nen-thom', 'kraft'],
    sortOrder: 10,
  },
  {
    id: '6f1c2a80-0002-4c3e-9a51-7d0e5a1f0002',
    boxTemplateId: 'pillow',
    title: 'Hộp Gối Trang Sức Valentine',
    description: 'Hộp gối ivory nhỏ gọn cho nhẫn, dây chuyền.',
    occasion: 'VALENTINE',
    industry: 'JEWELRY',
    dimensions: { length: 100, width: 60, height: 30, paperThickness: 0.35 },
    materialSpec: { type: 'ivory', gsm: 300, caliper: 0.35, finish: 'glossy' },
    canvasState: { elements: [text('title', 'With Love', 10, 14, '#D4AF37')] },
    tags: ['valentine', 'trang-suc'],
    sortOrder: 20,
  },
  {
    id: '6f1c2a80-0003-4c3e-9a51-7d0e5a1f0003',
    boxTemplateId: 'lid-base',
    title: 'Hộp Âm Dương Quà Cưới',
    description: 'Hộp cứng hai mảnh, nắp ivory ép kim cho quà cưới.',
    occasion: 'WEDDING',
    dimensions: { length: 200, width: 150, height: 60, paperThickness: 0.45 },
    materialSpec: { type: 'ivory', gsm: 350, caliper: 0.45, finish: 'glossy' },
    canvasState: { elements: [text('title', 'Hỷ', 30, 28, '#D4AF37')] },
    tags: ['cuoi', 'cao-cap'],
    sortOrder: 30,
  },
  {
    id: '6f1c2a80-0004-4c3e-9a51-7d0e5a1f0004',
    boxTemplateId: 'sleeve-drawer',
    title: 'Hộp Kéo Bánh Quy Sinh Nhật',
    description: 'Hộp bao diêm kraft cho bánh quy, khay kéo chắc chắn.',
    occasion: 'BIRTHDAY',
    industry: 'BAKERY',
    dimensions: { length: 160, width: 110, height: 45, paperThickness: 0.4 },
    materialSpec: { type: 'kraft', gsm: 300, caliper: 0.4, finish: 'raw' },
    canvasState: { elements: [text('title', 'Happy Birthday', 15, 14, '#2D5A27')] },
    tags: ['sinh-nhat', 'banh-quy'],
    sortOrder: 40,
  },
  {
    id: '6f1c2a80-0005-4c3e-9a51-7d0e5a1f0005',
    boxTemplateId: 'tuck-top',
    title: 'Hộp Skincare Tối Giản',
    description: 'Hộp đứng thanh mảnh cho serum, tông màu trung tính.',
    occasion: 'MINIMAL',
    industry: 'COSMETICS',
    dimensions: { length: 60, width: 60, height: 150, paperThickness: 0.35 },
    materialSpec: { type: 'ivory', gsm: 300, caliper: 0.35, finish: 'matte' },
    canvasState: { elements: [text('title', 'serum no.1', 60, 10, '#2B1E16')] },
    tags: ['skincare', 'toi-gian'],
    sortOrder: 50,
  },
  {
    id: '6f1c2a80-0006-4c3e-9a51-7d0e5a1f0006',
    boxTemplateId: 'lid-base',
    title: 'Hộp Trà Hoa Giáng Sinh',
    description: 'Hộp âm dương duplex cho trà hoa và nông sản biếu tặng.',
    occasion: 'CHRISTMAS',
    industry: 'TEA_AGRI',
    dimensions: { length: 120, width: 120, height: 80, paperThickness: 0.45 },
    materialSpec: { type: 'duplex', gsm: 350, caliper: 0.45, finish: 'matte' },
    canvasState: { elements: [text('title', 'Merry Christmas', 20, 14, '#1A3026')] },
    tags: ['noel', 'tra'],
    sortOrder: 60,
  },
];

async function main() {
  for (const template of boxTemplates) {
    await prisma.boxTemplate.upsert({ where: { id: template.id }, update: template, create: template });
  }
  console.log(`Seeded ${boxTemplates.length} box templates`);

  for (const { id, usesCount: _keepCount, ...design } of designTemplates) {
    // Never reset the usage counter of an existing template.
    await prisma.designTemplate.upsert({ where: { id }, update: design, create: { id, ...design } });
  }
  console.log(`Seeded ${designTemplates.length} curated design templates`);

  // The container runs this seed on every start: never create an admin with the well-known default password in production.
  const isProduction = process.env.NODE_ENV === 'production';
  const password = process.env.SEED_ADMIN_PASSWORD || (isProduction ? undefined : 'Admin@12345');
  if (!password) {
    console.log('Skipped admin + demo data (set SEED_ADMIN_PASSWORD to create an admin in production)');
    return;
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@wrapfit.vn').toLowerCase();
  // Anyone may have registered this address before the operator set SEED_ADMIN_PASSWORD: never verify (and so open)
  // such an account, and never make it an admin. The operator picks another address or deletes that account.
  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (existing && existing.role !== Role.ADMIN) {
    console.warn(`Skipped admin + demo data: ${email} already belongs to a ${existing.role} account (set SEED_ADMIN_EMAIL)`);
    return;
  }
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      emailVerifiedAt: new Date(),
      fullName: 'WrapFit Admin',
      shopName: 'WrapFit Studio',
      role: Role.ADMIN,
      subscriptionTier: SubscriptionTier.PRO_BUSINESS,
      passwordHash: await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS ?? 10)),
    },
  });
  // The operator chose this address: it counts as verified (accounts sign in only with a verified email), also for
  // an admin created before email verification existed.
  await prisma.user.updateMany({ where: { id: admin.id, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
  console.log(`Seeded admin user: ${admin.email}`);

  if (isProduction) return;

  const hasCollection = await prisma.projectCollection.count({ where: { userId: admin.id } });
  if (hasCollection === 0) {
    await prisma.projectCollection.create({
      data: {
        userId: admin.id,
        title: 'Bộ Hộp Quà Tết Bính Ngọ 2026',
        description: 'Bộ sưu tập mẫu được tạo bởi seed script.',
        colorTag: '#C0392B',
        projects: {
          create: {
            userId: admin.id,
            templateId: 'tuck-top',
            formulaVersion: 1,
            title: 'Hộp Nến Thơm Tinh Dầu',
            visibility: 'PUBLIC',
            dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.4 },
            materialSpec: { type: 'kraft', gsm: 300, caliper: 0.4, finish: 'matte' },
            canvasState: { elements: [] },
            tags: ['nen-thom', 'tet'],
          },
        },
      },
    });
    console.log('Seeded demo collection + project');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
