import { prisma } from "../src/lib/prisma.js"; // đổi path cho đúng dự án của bạn
import bcrypt from "bcryptjs";

// random int [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// random date trong 6 tháng gần nhất, đảm bảo check_out luôn ở quá khứ
function randomCheckInLastMonths(months = 6, maxNights = 3) {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - months);

  // để cộng thêm maxNights mà vẫn < now, trừ buffer 4 ngày
  const maxStart = new Date(now);
  maxStart.setDate(maxStart.getDate() - (maxNights + 1));

  const t =
    past.getTime() + Math.random() * (maxStart.getTime() - past.getTime());

  const checkIn = new Date(t);
  checkIn.setHours(14, 0, 0, 0); // cố định 14h

  const nights = randInt(1, maxNights);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + nights);

  return { checkIn, checkOut, nights };
}

// ... các hàm randInt, randomCheckInLastMonths giữ nguyên

async function main() {
  // Tạo hash cho mật khẩu dùng chung
  const plainPassword = "example123";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // Lấy khách sạn và các phòng hiện có
  const hotel = await prisma.hotel.findFirst({
    include: {
      rooms: {
        where: { active: true },
        include: { roomType: true },
      },
    },
  });

  if (!hotel || hotel.rooms.length === 0) {
    throw new Error("Không tìm thấy hotel hoặc room để seed booking");
  }

  const rooms = hotel.rooms;

  const seedUsers = [
    {
      fullName: "Nguyễn Minh An",
      email: "annguyen@example.com",
      phone: "0900000001",
    },
    {
      fullName: "Trần Thu Lan",
      email: "lantran@example.com",
      phone: "0900000002",
    },
    {
      fullName: "Lê Quốc Huy",
      email: "huyle@example.com",
      phone: "0900000003",
    },
    {
      fullName: "Phạm Hoài Anh",
      email: "anhpham@example.com",
      phone: "0900000004",
    },
    {
      fullName: "Đỗ Bảo Ngọc",
      email: "ngocdo@example.com",
      phone: "0900000005",
    },
  ];

  // Xoá dữ liệu cũ
  await prisma.review.deleteMany({
    where: { user: { email: { in: seedUsers.map((u) => u.email) } } },
  });
  await prisma.booking.deleteMany({
    where: { user: { email: { in: seedUsers.map((u) => u.email) } } },
  });
  await prisma.customer.deleteMany({
    where: { email: { in: seedUsers.map((u) => u.email) } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: seedUsers.map((u) => u.email) } },
  });

  for (const u of seedUsers) {
    // Tạo User (CUSTOMER) với passwordHash thật
    const user = await prisma.user.create({
      data: {
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: "CUSTOMER",
        passwordHash,
      },
    });

    // phần còn lại giữ nguyên...
    const customer = await prisma.customer.create({
      data: {
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        customerType: "REGISTERED",
        linkedUserId: user.id,
      },
    });

    for (let i = 0; i < 5; i++) {
      const room = rooms[randInt(0, rooms.length - 1)];
      const { checkIn, checkOut, nights } = randomCheckInLastMonths();

      const basePriceNumber = Number(room.roomType.basePrice);
      const totalPrice = basePriceNumber * nights;

      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          customerId: customer.id,
          roomId: room.id,
          checkIn,
          checkOut,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          guestType: "SELF",
          arrivalTime: "14:00",
          status: "CHECKED_OUT",
          totalPrice,
          discountAmount: 0,
          finalPrice: totalPrice,
          amountPaid: totalPrice,
          paymentStatus: "PAID",
          paymentMethod: "CARD",
          source: "ONLINE",
          createdByUserId: null,
          promotionId: null,
          payments: {
            create: {
              amount: totalPrice,
              method: "CARD",
              status: "PAID",
              paidAt: checkOut,
              provider: "SEED",
              note: "Sample payment from seed script",
            },
          },
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          customerId: customer.id,
          roomId: room.id,
          overall: randInt(4, 5),
          cleanliness: randInt(4, 5),
          comfort: randInt(4, 5),
          locationScore: randInt(4, 5),
          valueForMoney: randInt(4, 5),
          hygiene: randInt(4, 5),
          comment:
            "Phòng sạch sẽ, nhân viên thân thiện và trải nghiệm lưu trú rất tốt. Dữ liệu được tạo từ seed script cho mục đích demo.",
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log("Seed dữ liệu user + booking + review hoàn tất.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
