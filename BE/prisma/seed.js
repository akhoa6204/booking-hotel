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
    {
      code: "MORNING",
      name: "Ca sáng",
      startTime: "06:00:00",
      endTime: "14:00:00",
    },
    {
      code: "AFTERNOON",
      name: "Ca chiều",
      startTime: "14:00:00",
      endTime: "22:00:00",
    },
    {
      code: "NIGHT",
      name: "Ca đêm",
      startTime: "22:00:00",
      endTime: "06:00:00",
    },
    {
      code: "OFFICE",
      name: "Ca hành chính",
      startTime: "08:00:00",
      endTime: "17:00:00",
    },
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
      email: "admin@diamondsea.hotel.com",
      position: "MANAGER",
      isAdmin: true,
    },
    {
      fullName: "Hotel Manager",
      email: "manager@diamondsea.hotel.com",
      position: "MANAGER",
    },
    {
      fullName: "Reception 1",
      email: "reception1@diamondsea.hotel.com",
      position: "RECEPTION",
    },
    {
      fullName: "Reception 2",
      email: "reception2@diamondsea.hotel.com",
      position: "RECEPTION",
    },
    {
      fullName: "Housekeeping 1",
      email: "housekeeping1@diamondsea.hotel.com",
      position: "HOUSEKEEPING",
    },
    {
      fullName: "Housekeeping 2",
      email: "housekeeping2@diamondsea.hotel.com",
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
        description: `${r.name} tại diamondsea Hotel mang đến không gian nghỉ dưỡng hiện đại và thoải mái.
Phòng được thiết kế tinh tế với nội thất cao cấp, đảm bảo sự tiện nghi cho mọi nhu cầu lưu trú.
Không gian rộng rãi, ánh sáng tự nhiên hài hòa cùng tầm nhìn đẹp tạo cảm giác thư giãn tuyệt đối.
Phù hợp cho khách du lịch, công tác hoặc gia đình mong muốn trải nghiệm dịch vụ chất lượng cao tại Đà Nẵng.`,
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

async function seedRoomTypeAmenities(roomTypes) {
  const amenities = await prisma.amenity.findMany();

  for (let i = 0; i < roomTypes.length; i++) {
    const roomType = roomTypes[i];

    // mỗi loại phòng có 6 amenities (xoay vòng để không bị trùng hoàn toàn)
    for (let j = 0; j < 6; j++) {
      const amenity = amenities[(i * 6 + j) % amenities.length];

      await prisma.roomTypeAmenity.create({
        data: {
          roomTypeId: roomType.id,
          amenityId: amenity.id,
        },
      });
    }
  }
}

async function seedRoomTypeImages(roomTypes) {
  const imageMemoryById = {
    6: [
      "http://localhost:3001/uploads/room-types/1774279639098-855223290.jpg",
      "http://localhost:3001/uploads/room-types/1774279639100-923185397.jpg",
      "http://localhost:3001/uploads/room-types/1774279639105-32573968.jpg",
      "http://localhost:3001/uploads/room-types/1774279639111-837538821.jpg",
      "http://localhost:3001/uploads/room-types/1774279657681-385460459.jpg",
    ],
    5: [
      "http://localhost:3001/uploads/room-types/1774279679753-593137400.jpg",
      "http://localhost:3001/uploads/room-types/1774279679756-99730602.jpg",
      "http://localhost:3001/uploads/room-types/1774279679762-738431835.jpg",
      "http://localhost:3001/uploads/room-types/1774279679767-92309558.jpg",
      "http://localhost:3001/uploads/room-types/1774279679768-26853761.jpg",
    ],
    4: [
      "http://localhost:3001/uploads/room-types/1774279722035-747947416.jpg",
      "http://localhost:3001/uploads/room-types/1774279722036-66832383.jpg",
      "http://localhost:3001/uploads/room-types/1774279722041-840075501.jpg",
      "http://localhost:3001/uploads/room-types/1774279722043-676663480.jpg",
      "http://localhost:3001/uploads/room-types/1774279745825-777483671.jpg",
    ],
    3: [
      "http://localhost:3001/uploads/room-types/1774279764167-269263227.jpg",
      "http://localhost:3001/uploads/room-types/1774279764172-653445457.jpg",
      "http://localhost:3001/uploads/room-types/1774279764174-559097102.jpg",
      "http://localhost:3001/uploads/room-types/1774279764176-583149283.jpg",
      "http://localhost:3001/uploads/room-types/1774279776387-683021510.jpg",
    ],
    2: [
      "http://localhost:3001/uploads/room-types/1774279791676-843229166.jpg",
      "http://localhost:3001/uploads/room-types/1774279818916-553646369.jpg",
      "http://localhost:3001/uploads/room-types/1774279829121-936534818.jpg",
      "http://localhost:3001/uploads/room-types/1774279841593-725294812.jpg",
      "http://localhost:3001/uploads/room-types/1774279856649-890632474.jpg",
    ],
    1: [
      "http://localhost:3001/uploads/room-types/1774279873432-944715223.jpg",
      "http://localhost:3001/uploads/room-types/1774279910943-492064242.jpg",
      "http://localhost:3001/uploads/room-types/1774279910944-384175663.jpg",
      "http://localhost:3001/uploads/room-types/1774279910948-887610672.jpg",
      "http://localhost:3001/uploads/room-types/1774279910950-961548980.jpg",
    ],
  };

  for (const rt of roomTypes) {
    const urls = imageMemoryById[rt.id] || [];

    for (let i = 0; i < urls.length; i++) {
      await prisma.roomTypeImage.create({
        data: {
          roomTypeId: rt.id,
          url: urls[i],
          isPrimary: i === 0,
        },
      });
    }
  }
}

async function seedPromotions() {
  const promos = [
    // ACTIVE
    {
      name: "Summer Sale",
      code: "SUMMER2026",
      type: "PERCENT",
      value: 10,
      autoApply: true,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-12-31"),
    },

    {
      name: "Weekend Deal",
      code: "WEEKEND2026",
      type: "PERCENT",
      value: 15,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-12-31"),
    },

    {
      name: "Early Bird",
      code: "EARLY2026",
      type: "PERCENT",
      value: 12,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-12-31"),
    },

    {
      name: "Long Stay",
      code: "LONGSTAY2026",
      type: "PERCENT",
      value: 20,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-12-31"),
    },

    {
      name: "VIP Member",
      code: "VIP2026",
      type: "PERCENT",
      value: 25,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-12-31"),
    },

    // EXPIRED
    {
      name: "Tet Holiday",
      code: "TET2025",
      type: "PERCENT",
      value: 20,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-04-10"),
    },

    {
      name: "Black Friday",
      code: "BLACK2025",
      type: "PERCENT",
      value: 30,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-04-25"),
    },

    {
      name: "Flash Sale",
      code: "FLASH2025",
      type: "PERCENT",
      value: 18,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-04-02"),
    },

    {
      name: "Lunar New Year",
      code: "LUNAR2025",
      type: "PERCENT",
      value: 22,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-04-15"),
    },

    {
      name: "Old Customer",
      code: "OLD2025",
      type: "PERCENT",
      value: 8,
      isActive: true,
      startAt: new Date("2025-01-01"),
      endAt: new Date("2026-04-01"),
    },
  ];

  const createdPromos = [];

  for (const p of promos) {
    const promo = await prisma.promotion.create({
      data: {
        name: p.name,
        code: p.code,
        type: p.type,
        value: p.value,
        autoApply: p.autoApply || false,

        scope: "GLOBAL",

        isActive: p.isActive,

        startAt: p.startAt,
        endAt: p.endAt,

        quotaTotal: 100,

        quotaUsed: Math.floor(Math.random() * 100) + 1,
      },
    });

    createdPromos.push(promo);
  }

  return createdPromos;
}

async function seedServices() {
  const services = [
    // 10 dịch vụ
    {
      name: "Giặt ủi",
      description: "Dịch vụ giặt ủi trong ngày",
      price: 150000,
      type: "SERVICE",
    },
    {
      name: "Đưa đón sân bay",
      description: "Xe đưa đón sân bay 1 chiều",
      price: 300000,
      type: "SERVICE",
    },
    {
      name: "Thuê xe máy",
      description: "Cho thuê xe máy theo ngày",
      price: 120000,
      type: "SERVICE",
    },
    {
      name: "Thuê xe ô tô",
      description: "Cho thuê xe ô tô tự lái",
      price: 900000,
      type: "SERVICE",
    },
    {
      name: "Spa thư giãn",
      description: "Dịch vụ massage & spa",
      price: 500000,
      type: "SERVICE",
    },
    {
      name: "Bữa sáng buffet",
      description: "Buffet sáng tại nhà hàng",
      price: 200000,
      type: "SERVICE",
    },
    {
      name: "Trang trí phòng",
      description: "Trang trí phòng sinh nhật/kỷ niệm",
      price: 400000,
      type: "SERVICE",
    },
    {
      name: "Thuê phòng họp",
      description: "Sử dụng phòng họp theo giờ",
      price: 600000,
      type: "SERVICE",
    },
    {
      name: "Dịch vụ in ấn",
      description: "In ấn tài liệu tại quầy lễ tân",
      price: 50000,
      type: "SERVICE",
    },
    {
      name: "Giữ hành lý",
      description: "Giữ hành lý sau check-out",
      price: 80000,
      type: "SERVICE",
    },

    // 10 phí phát sinh
    {
      name: "Phí trả phòng trễ",
      description: "Phụ phí check-out sau giờ",
      price: 180000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí hút thuốc",
      description: "Phụ phí do hút thuốc trong phòng",
      price: 500000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí làm hư hỏng",
      description: "Bồi thường hư hỏng tài sản",
      price: 1000000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí thêm khách",
      description: "Phụ phí thêm khách vượt quá tiêu chuẩn",
      price: 250000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí đổi phòng",
      description: "Phụ phí đổi phòng theo yêu cầu",
      price: 200000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí dọn phòng đặc biệt",
      description: "Dọn phòng theo yêu cầu riêng",
      price: 150000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí làm mất thẻ phòng",
      description: "Phụ phí mất thẻ từ",
      price: 100000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí minibar",
      description: "Chi phí sử dụng minibar",
      price: 300000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí vệ sinh tăng cường",
      description: "Vệ sinh tăng cường khi cần thiết",
      price: 220000,
      type: "EXTRA_FEE",
    },
    {
      name: "Phí hủy sát giờ",
      description: "Phụ phí hủy phòng sát giờ",
      price: 400000,
      type: "EXTRA_FEE",
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({
      where: { name: s.name },
    });

    if (!existing) {
      await prisma.service.create({
        data: s,
      });
    }
  }
}
async function seedReviews(bookings) {
  for (const b of bookings) {
    if (!b.customerId) continue;

    await prisma.review.create({
      data: {
        bookingId: b.id,
        overall: 5,
        cleanliness: 5,
        comfort: 5,
        comment: "Great stay at diamondsea Hotel!",
        status: "PUBLISHED",
      },
    });
  }
}
async function seedCustomers() {
  const passwordHash = await bcrypt.hash("123", 10);

  const vietnameseNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Văn Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
    "Võ Thị Giang",
    "Đặng Văn Hải",
    "Bùi Thị Lan",
    "Phan Văn Minh",
    "Đỗ Thị Ngọc",
  ];

  const createdCustomers = [];

  for (let i = 0; i < 10; i++) {
    const email = `customer${i + 1}@gmail.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName: vietnameseNames[i],
        email,
        passwordHash,
        type: "CUSTOMER",
      },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });

    createdCustomers.push({
      ...customer,
      user,
    });
  }

  return createdCustomers;
}
async function seedShiftAssignments() {
  const staffs = await prisma.staff.findMany();
  const shifts = await prisma.shift.findMany();

  const now = new Date();

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const baseDate = new Date();
    baseDate.setMonth(now.getMonth() - monthOffset);

    for (let week = 0; week < 4; week++) {
      for (const staff of staffs) {
        for (let day = 0; day < 7; day++) {
          const workDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            week * 7 + day + 1,
          );

          const shift = shifts[(day + staff.id) % shifts.length];

          await prisma.staffShiftAssignment.create({
            data: {
              staffId: staff.id,
              shiftId: shift.id,
              workDate,
              position: staff.position,
            },
          });
        }
      }
    }
  }
}
async function seedBookings(customers) {
  const rooms = await prisma.room.findMany({
    include: {
      roomType: true,
    },
  });

  const services = await prisma.service.findMany();

  const promotions = await prisma.promotion.findMany();

  const bookings = [];

  const today = new Date();

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const baseDate = new Date();

    baseDate.setMonth(today.getMonth() - monthOffset);

    for (let i = 0; i < 25; i++) {
      const isOnline = i < 15;

      const customer = customers[i % customers.length];

      const room = rooms[(monthOffset * 25 + i) % rooms.length];

      const promotion =
        promotions[Math.floor(Math.random() * promotions.length)];

      const randomPercent = Math.random();

      let checkIn;
      let checkOut;
      let status;

      const randomDay = Math.floor(Math.random() * 28) + 1;

      checkIn = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        randomDay,
      );

      const stayDays = Math.floor(Math.random() * 3) + 1;

      checkOut = new Date(checkIn.getTime() + stayDays * 86400000);
      
      // AUTO STATUS BASED ON DATE
      if (checkOut < today) {
        status = "CHECKED_OUT";
      } else if (checkIn <= today && checkOut >= today) {
        status = "CHECKED_IN";
      } else {
        status = "CONFIRMED";
      }

      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / 86400000,
      );

      const subtotal = Number(room.roomType.basePrice) * nights;

      let discount = 0;

      if (promotion.type === "PERCENT") {
        discount = Math.floor((subtotal * Number(promotion.value)) / 100);
      }

      const booking = await prisma.booking.create({
        data: {
          customerId: isOnline ? customer.id : null,
          roomId: room.id,

          fullName: isOnline
            ? customer.user.fullName
            : `Walkin Guest ${monthOffset}-${i}`,

          phone: "0900000000",

          email: isOnline
            ? customer.user.email
            : `walkin${monthOffset}-${i}@gmail.com`,

          guestType: isOnline ? "SELF" : "OTHER",

          checkIn,
          checkOut,

          status,
        },
      });

      const invoice = await prisma.invoice.create({
        data: {
          bookingId: booking.id,

          subtotal,
          discount,

          tax: 0,

          paidAmount: status === "CONFIRMED" ? 0 : subtotal - discount,

          status: status === "CONFIRMED" ? "ACTIVE" : "PAID",
        },
      });

      // ROOM ITEM
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,

          type: "ROOM",

          description: `${room.roomType.name} - ${nights} nights`,

          quantity: nights,

          unitPrice: Number(room.roomType.basePrice),

          totalPrice: subtotal,

          promotionId: promotion.id,
        },
      });

      // RANDOM SERVICES
      const randomServices = services
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      for (const service of randomServices) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,

            type: service.type,

            description: service.name,

            quantity: 1,

            unitPrice: Number(service.price),

            totalPrice: Number(service.price),

            serviceId: service.id,
          },
        });
      }

      // PAYMENTS
      if (status !== "CONFIRMED") {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,

            type: "ROOM",

            amount: subtotal - discount,

            method: Math.random() > 0.5 ? "CASH" : "TRANSFER",

            status: "PAID",

            paidAt: checkOut,
          },
        });
      }

      bookings.push({
        booking,
        services: randomServices,
      });
    }
  }

  return bookings;
}
async function seedHousekeeping(bookings) {
  const staffs = await prisma.staff.findMany();

  const housekeepingStaff = staffs.find((s) => s.position === "HOUSEKEEPING");

  let cleanTaskCount = 0;

  for (const item of bookings) {
    const booking = item.booking;

    const services = item.services;

    // inspection task sau checkout
    if (booking.status === "CHECKED_OUT") {
      await prisma.housekeepingTask.create({
        data: {
          roomId: booking.roomId,

          bookingId: booking.id,

          staffId: housekeepingStaff?.id,

          workDate: new Date(
            booking.checkOut.getTime() + Math.floor(Math.random() * 86400000),
          ),

          type: "INSPECTION",

          status: "DONE",

          note: "Kiểm tra phòng sau check-out",
        },
      });
    }

    const hasCleaningService =
      services.some(
        (s) =>
          s.name.includes("Giặt") ||
          s.name.includes("dọn") ||
          s.name.includes("vệ sinh"),
      ) || cleanTaskCount < 10;

    if (hasCleaningService) {
      cleanTaskCount++;

      await prisma.housekeepingTask.create({
        data: {
          roomId: booking.roomId,

          bookingId: booking.id,

          staffId: housekeepingStaff?.id,

          workDate: new Date(
            booking.checkIn.getTime() + Math.floor(Math.random() * 86400000),
          ),

          type: "CLEANING",

          status: Math.random() > 0.2 ? "DONE" : "PENDING",

          note: "Dọn phòng theo yêu cầu khách",
        },
      });
    }
  }
}
async function main() {
  console.log("Seeding database...");

  await seedAmenities();
  await seedShifts();
  await seedUsers();

  const roomTypes = await seedRoomTypes();
  await seedRooms(roomTypes);
  await seedRoomTypeAmenities(roomTypes);
  await seedRoomTypeImages(roomTypes);

  await seedPromotions();
  await seedServices();

  const customers = await seedCustomers();
  const bookings = await seedBookings(customers);

  await seedShiftAssignments();

  await seedReviews(bookings);
  await seedHousekeeping(bookings);

  console.log("Seed completed for diamondsea Hotel");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
