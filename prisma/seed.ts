import { PrismaClient, Role, EquipmentStatus, EquipmentCondition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mihwar.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Mihwar@2026";
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminName = process.env.ADMIN_NAME ?? "مدير الفريق";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.ADMIN, active: true },
    create: {
      email: adminEmail,
      username: adminUsername,
      name: adminName,
      nameAr: adminName,
      passwordHash,
      role: Role.ADMIN,
      position: "Studio Director",
      positionAr: "مدير الاستوديو",
    },
  });

  console.log("Admin ready:", admin.email);

  const categories = [
    { slug: "cameras", name: "Cameras", nameAr: "كاميرات", icon: "camera" },
    { slug: "lenses", name: "Lenses", nameAr: "عدسات", icon: "lens" },
    { slug: "lighting", name: "Lighting", nameAr: "إضاءة", icon: "light" },
    { slug: "audio", name: "Audio", nameAr: "صوت", icon: "audio" },
    { slug: "stabilizers", name: "Stabilizers", nameAr: "مثبّتات", icon: "stab" },
    { slug: "drones", name: "Drones", nameAr: "طائرات", icon: "drone" },
    { slug: "accessories", name: "Accessories", nameAr: "ملحقات", icon: "kit" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log("Categories ready:", categories.length);

  const memberHash = await bcrypt.hash("Member@2026", 12);
  const members = [
    {
      email: "yara@mihwar.local",
      username: "yara.shoots",
      name: "Yara Hadidi",
      nameAr: "يارا الحديدي",
      position: "Lead Photographer",
      positionAr: "مصوّرة رئيسية",
    },
    {
      email: "majd@mihwar.local",
      username: "majd.frame",
      name: "Majd Al-Qudsi",
      nameAr: "مجد القدسي",
      position: "Cinematographer",
      positionAr: "مصوّر سينمائي",
    },
    {
      email: "rana@mihwar.local",
      username: "rana.lights",
      name: "Rana Tabba",
      nameAr: "رنا طبّاع",
      position: "Lighting Technician",
      positionAr: "فنّية إضاءة",
    },
  ];

  const memberRecords = [];
  for (const m of members) {
    const u = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        ...m,
        passwordHash: memberHash,
        role: Role.MEMBER,
      },
    });
    memberRecords.push(u);
  }
  console.log("Members ready:", memberRecords.length);

  const cams = await prisma.category.findUnique({ where: { slug: "cameras" } });
  const lenses = await prisma.category.findUnique({ where: { slug: "lenses" } });
  const lights = await prisma.category.findUnique({ where: { slug: "lighting" } });
  const stabs = await prisma.category.findUnique({ where: { slug: "stabilizers" } });

  const items = [
    {
      serial: "MHW-A7M4-001",
      name: "Sony A7 IV",
      nameAr: "سوني A7 IV",
      brand: "Sony",
      model: "ILCE-7M4",
      categoryId: cams?.id,
      ownerId: memberRecords[0].id,
      status: EquipmentStatus.IN_USE,
      condition: EquipmentCondition.PRISTINE,
      description: "Full-frame mirrorless. Hybrid 33MP photo and 4K60 video workhorse.",
      descriptionAr: "كاميرا فل-فريم بدون مرآة. ٣٣ ميغابكسل وفيديو 4K بمعدل ٦٠ إطار.",
      images: [
        "https://images.unsplash.com/photo-1606980606547-7d3a437bcae8?q=85&w=1280",
      ],
    },
    {
      serial: "MHW-R5C-014",
      name: "Canon EOS R5 C",
      nameAr: "كانون EOS R5 C",
      brand: "Canon",
      model: "R5 C",
      categoryId: cams?.id,
      ownerId: memberRecords[1].id,
      status: EquipmentStatus.IN_USE,
      condition: EquipmentCondition.EXCELLENT,
      description: "Hybrid cinema body. 8K RAW with active cooling for unlimited recording.",
      descriptionAr: "جسم سينمائي هجين. تسجيل 8K RAW بتبريد نشط بلا قيود زمنية.",
      images: [
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=85&w=1280",
      ],
    },
    {
      serial: "MHW-2470-022",
      name: "Sony FE 24-70mm f/2.8 GM II",
      nameAr: "عدسة سوني FE 24-70mm f/2.8 GM II",
      brand: "Sony",
      model: "SEL2470GM2",
      categoryId: lenses?.id,
      ownerId: null,
      status: EquipmentStatus.AVAILABLE,
      condition: EquipmentCondition.PRISTINE,
      description: "Premium standard zoom. 22% lighter than predecessor.",
      descriptionAr: "زوم قياسي ممتاز. أخف بنسبة ٢٢٪ من الإصدار السابق.",
      images: [
        "https://images.unsplash.com/photo-1617638924751-f8b2f5f4c2dc?q=85&w=1280",
      ],
    },
    {
      serial: "MHW-5085-031",
      name: "Sigma 50-100mm f/1.8 Art",
      nameAr: "سيجما 50-100mm f/1.8 Art",
      brand: "Sigma",
      model: "Art 50-100",
      categoryId: lenses?.id,
      ownerId: memberRecords[2].id,
      status: EquipmentStatus.IN_USE,
      condition: EquipmentCondition.GOOD,
      description: "Constant f/1.8 telephoto for portraits. Heavy but unmatched draw.",
      descriptionAr: "تيلي بفتحة ثابتة f/1.8 للبورتريه. ثقيلة لكنّ رسمها لا يُضاهى.",
      images: [
        "https://images.unsplash.com/photo-1606937295547-bc0f668c9aaa?q=85&w=1280",
      ],
    },
    {
      serial: "MHW-AP400-007",
      name: "Aputure LS 600d Pro",
      nameAr: "إضاءة Aputure LS 600d Pro",
      brand: "Aputure",
      model: "LS 600d Pro",
      categoryId: lights?.id,
      ownerId: null,
      status: EquipmentStatus.AVAILABLE,
      condition: EquipmentCondition.EXCELLENT,
      description: "720W daylight LED. Bowens mount, weather-sealed for outdoor sets.",
      descriptionAr: "ليد ضوء نهار ٧٢٠ واط. حامل Bowens ومقاوم للأجواء الخارجية.",
      images: [
        "https://images.unsplash.com/photo-1505739998589-00fc191ce01d?q=85&w=1280",
      ],
    },
    {
      serial: "MHW-RS3P-019",
      name: "DJI RS 3 Pro",
      nameAr: "مثبّت DJI RS 3 Pro",
      brand: "DJI",
      model: "RS 3 Pro",
      categoryId: stabs?.id,
      ownerId: memberRecords[1].id,
      status: EquipmentStatus.IN_USE,
      condition: EquipmentCondition.EXCELLENT,
      description: "Pro 3-axis gimbal. 4.5kg payload, LiDAR focus motor compatible.",
      descriptionAr: "جمبل احترافي ثلاثي المحاور. حمولة ٤٫٥ كغ ومتوافق مع موتور LiDAR.",
      images: [
        "https://images.unsplash.com/photo-1610141050253-5b34e4d3c9f6?q=85&w=1280",
      ],
    },
  ];

  for (const it of items) {
    const { images, ...data } = it;
    const eq = await prisma.equipment.upsert({
      where: { serial: it.serial },
      update: data,
      create: data,
    });

    await prisma.equipmentImage.deleteMany({ where: { equipmentId: eq.id } });
    for (let i = 0; i < images.length; i++) {
      await prisma.equipmentImage.create({
        data: {
          equipmentId: eq.id,
          url: images[i],
          alt: it.name,
          isPrimary: i === 0,
          position: i,
        },
      });
    }
  }
  console.log("Equipment ready:", items.length);

  console.log("\nSeed complete.\nLogin as admin:", adminEmail, "/ password:", adminPassword);
  console.log("Members password (all):", "Member@2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
