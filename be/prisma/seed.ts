import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default WrapFit data...");

  // 1. Seed demo user for testing & local development
  await prisma.user.upsert({
    where: { email: "demo@wrapfit.local" },
    update: {},
    create: {
      id: "demo-user-id",
      email: "demo@wrapfit.local",
      shopName: "WrapFit Craft & Gift Studio",
      subscriptionTier: "pro"
    }
  });
  console.log("Demo user ensured: demo-user-id (demo@wrapfit.local)");

  // 2. Seed default box templates
  const templates = [
    {
      id: "tuck-top",
      name: "Hộp nắp gài đáy khóa (Tuck Top Box)",
      description: "Hộp quà bán lẻ tiêu chuẩn, nắp gài trên và đáy gấp khóa chịu lực.",
      formulaSchema: {
        type: "tuck-top",
        flaps: ["glue", "dust_left", "dust_right", "tuck_top", "lock_bottom"]
      },
      isActive: true
    },
    {
      id: "sleeve-drawer",
      name: "Hộp kéo bao diêm (Sleeve & Drawer Box)",
      description: "Bao gồm vỏ bao bên ngoài và khay trượt bên trong, sang trọng và độc đáo.",
      formulaSchema: {
        type: "sleeve-drawer",
        parts: ["sleeve", "drawer"]
      },
      isActive: true
    },
    {
      id: "lid-base",
      name: "Hộp âm dương (Lid & Base Box)",
      description: "Hộp quà hai mảnh tách biệt (nắp trên và đáy dưới), phù hợp quà tặng cao cấp.",
      formulaSchema: {
        type: "lid-base",
        parts: ["lid", "base"]
      },
      isActive: true
    },
    {
      id: "pillow",
      name: "Hộp gối (Pillow Box)",
      description: "Hộp gấp nếp cong mềm mại, chuyên dùng cho trang sức, phụ kiện nhỏ và thiệp.",
      formulaSchema: {
        type: "pillow",
        features: ["curved_crease"]
      },
      isActive: true
    }
  ];

  for (const t of templates) {
    await prisma.boxTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
