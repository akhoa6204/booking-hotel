import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function seedAmenities() {
  const amenities = [
    { code: "WIFI", label: "Wi-Fi miễn phí" },
    { code: "AC", label: "Điều hoà" },
    { code: "TV", label: "TV màn hình phẳng" },
    { code: "MINIBAR", label: "Minibar" },
    { code: "FRIDGE", label: "Tủ lạnh" },
    { code: "SAFE", label: "Két an toàn" },
    { code: "DESK", label: "Bàn làm việc" },
    { code: "WARDROBE", label: "Tủ quần áo" },
    { code: "HAIR_DRYER", label: "Máy sấy tóc" },
    { code: "KETTLE", label: "Ấm đun nước" },
    { code: "COFFEE_TEA", label: "Trà/Cà phê" },
    { code: "BATHROOM_PRIVATE", label: "Phòng tắm riêng" },
    { code: "SHOWER", label: "Vòi sen" },
    { code: "BATHTUB", label: "Bồn tắm" },
    { code: "TOWELS", label: "Khăn tắm" },
    { code: "TOILETRIES", label: "Đồ vệ sinh cá nhân" },
    { code: "SLIPPERS", label: "Dép đi trong phòng" },
    { code: "BALCONY", label: "Ban công" },
    { code: "CITY_VIEW", label: "View thành phố" },
    { code: "SEA_VIEW", label: "View biển" },
    { code: "SOUNDPROOF", label: "Cách âm" },
    { code: "NON_SMOKING", label: "Phòng không hút thuốc" },
  ];

  for (const a of amenities) {
    await prisma.amenity.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }
}

async function seedShifts() {
  const shifts = [
    { code: "MORNING", name: "Ca sáng", startTime: "06:00:00", endTime: "14:00:00" },
    { code: "AFTERNOON", name: "Ca chiều", startTime: "14:00:00", endTime: "22:00:00" },
    { code: "NIGHT", name: "Ca đêm", startTime: "22:00:00", endTime: "06:00:00" },
    { code: "OFFICE", name: "Ca hành chính", startTime: "08:00:00", endTime: "17:00:00" },
  ];

  for (const s of shifts) {
    await prisma.shift.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        name: s.name,
        startTime: new Date(`1970-01-01T${s.startTime}Z`),
        endTime: new Date(`1970-01-01T${s.endTime}Z`),
      },
    });
  }
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("123", 10);

  const users = [
    {
      fullName: "System Admin",
      email: "admin@skyline.hotel.com",
      position: "MANAGER",
      isAdmin: true,
    },
    {
      fullName: "Hotel Manager",
      email: "manager@skyline.hotel.com",
      position: "MANAGER",
    },
    {
      fullName: "Reception 1",
      email: "reception1@skyline.hotel.com",
      position: "RECEPTION",
    },
    {
      fullName: "Reception 2",
      email: "reception2@skyline.hotel.com",
      position: "RECEPTION",
    },
    {
      fullName: "Housekeeping 1",
      email: "housekeeping1@skyline.hotel.com",
      position: "HOUSEKEEPING",
    },
    {
      fullName: "Housekeeping 2",
      email: "housekeeping2@skyline.hotel.com",
      position: "HOUSEKEEPING",
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        fullName: u.fullName,
        email: u.email,
        passwordHash,
        type: "STAFF",
      },
    });

    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        position: u.position,
        isAdmin: u.isAdmin || false,
      },
    });
  }
}

async function seedHotel() {
  return prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Skyline",
      address: "71 Ngũ Hành Sơn, Đà Nẵng",
      description: "Skyline Hotel Demo",
    },
  });
}

async function seedRoomTypes() {
  const roomTypes = [
    { name: "Standard Room", price: 500000, capacity: 2 },
    { name: "Superior Room", price: 650000, capacity: 2 },
    { name: "Deluxe Room", price: 800000, capacity: 2 },
    { name: "Twin Room", price: 850000, capacity: 2 },
    { name: "Family Room", price: 1200000, capacity: 4 },
    { name: "Suite", price: 1500000, capacity: 2 },
  ];

  const results = [];

  for (const r of roomTypes) {
    const rt = await prisma.roomType.create({
      data: {
        name: r.name,
        basePrice: r.price,
        capacity: r.capacity,
        description: `${r.name} at Skyline Hotel`,
      },
    });
    results.push(rt);
  }

  return results;
}

async function seedRooms(roomTypes) {
  let counter = 1;

  for (let i = 0; i < 20; i++) {
    const rt = roomTypes[i % roomTypes.length];

    await prisma.room.create({
      data: {
        name: `Room ${100 + counter}`,
        roomTypeId: rt.id,
      },
    });

    counter++;
  }
}

async function seedPromotions() {
  const promos = [
    {
      name: "Summer Sale",
      type: "PERCENT",
      value: 10,
      autoApply: true,
    },
    {
      name: "Weekend Deal",
      type: "PERCENT",
      value: 15,
    },
    {
      name: "Early Bird",
      type: "PERCENT",
      value: 12,
    },
    {
      name: "Long Stay",
      type: "PERCENT",
      value: 20,
    },
    {
      name: "VIP Member",
      type: "PERCENT",
      value: 18,
    },
  ];

  for (const p of promos) {
    await prisma.promotion.create({
      data: {
        name: p.name,
        type: p.type,
        value: p.value,
        autoApply: p.autoApply || false,
        startAt: new Date(),
        endAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        scope: "GLOBAL",
      },
    });
  }
}

async function main() {
  console.log("Seeding database...");

  await seedAmenities();
  await seedShifts();
  await seedUsers();

  const hotel = await seedHotel();
  const roomTypes = await seedRoomTypes();
  await seedRooms(roomTypes);

  await seedPromotions();

  console.log("Seed completed for Skyline Hotel");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
