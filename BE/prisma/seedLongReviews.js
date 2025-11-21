// scripts/seedLongReviewsOnlineOnly.js
import { prisma } from "../src/lib/prisma.js"; // đổi path cho đúng dự án của bạn

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const openers = [
  "Trải nghiệm tổng thể rất ổn.",
  "Mình khá hài lòng sau kỳ nghỉ.",
  "Khách sạn đáp ứng đúng kỳ vọng.",
  "Dịch vụ tốt hơn so với giá tiền.",
  "Không gian yên tĩnh, phù hợp nghỉ dưỡng.",
  "Lần đầu ở đây và khá ấn tượng.",
];

const roomClean = [
  "Phòng sạch sẽ, chăn ga thơm, sàn nhà vệ sinh khô ráo.",
  "Công tác vệ sinh được làm kỹ, không có mùi ẩm mốc.",
  "Ga gối mềm, nệm êm; phòng dọn mỗi ngày rất gọn gàng.",
  "Phòng thoáng khí, điều hòa chạy êm, không ồn.",
];

const facility = [
  "Trang thiết bị đầy đủ, nước nóng ổn định, wifi nhanh.",
  "Có bàn làm việc, ổ điện tiện, TV kết nối tốt.",
  "Thang máy nhanh, khu vực chung rộng rãi và sạch.",
  "Bãi đỗ xe tiện; lễ tân hỗ trợ rất nhiệt tình.",
];

const locationFood = [
  "Vị trí gần trung tâm, đi bộ vài phút ra khu ăn uống.",
  "Xung quanh nhiều quán ăn địa phương ngon, giá hợp lý.",
  "Dễ gọi xe; di chuyển ra điểm du lịch mất 5–10 phút.",
  "Khu vực an ninh, ban đêm vẫn yên tĩnh.",
];

const staff = [
  "Nhân viên thân thiện, hỗ trợ check-in nhanh, tư vấn địa điểm tham quan.",
  "Lễ tân phản hồi tin nhắn rất nhanh, tác phong chuyên nghiệp.",
  "Bảo vệ nhiệt tình chỉ chỗ đậu xe, hướng dẫn rõ ràng.",
  "Housekeeping dễ thương, hỗ trợ thêm khăn khi cần.",
];

const value = [
  "Với mức giá này thì quá đáng tiền, sẽ quay lại.",
  "Tổng thể xứng đáng; phù hợp đi công tác lẫn du lịch.",
  "Chất lượng tốt so với tầm giá; đáng để giới thiệu bạn bè.",
  "Nếu đặt sớm có giá tốt hơn, rất đáng trải nghiệm.",
];

const consSoft = [
  "Điểm trừ nhẹ là cách âm chưa thật sự tốt vào giờ cao điểm.",
  "Có thể cải thiện thêm chỗ treo đồ trong phòng tắm.",
  "Bữa sáng chưa đa dạng lắm, nhưng chấp nhận được.",
  "Chỗ gửi xe hơi hạn chế vào cuối tuần.",
];

// ghép 2–5 câu, trong đó 0–1 câu “cons” tùy ngẫu nhiên
function buildLongComment() {
  const parts = [
    pick(openers),
    pick(roomClean),
    pick(facility),
    pick(locationFood),
    pick(staff),
    pick(value),
  ];

  // random bỏ bớt 1–2 câu để tự nhiên hơn
  const toRemove = randint(1, 2);
  for (let i = 0; i < toRemove; i++) {
    parts.splice(randint(0, parts.length - 2), 1); // giữ lại câu mở đầu
  }

  // thỉnh thoảng chèn 1 câu “cons”
  if (Math.random() < 0.4)
    parts.splice(randint(2, parts.length), 0, pick(consSoft));

  // lấy 2–5 câu
  const take = randint(2, Math.min(5, parts.length));
  return parts.slice(0, take).join(" ");
}

async function seedLongReviews() {
  const bookings = await prisma.booking.findMany({
    where: { source: "ONLINE", status: "CHECKED_OUT", paymentStatus: "PAID" },
    select: { id: true, roomId: true, customerId: true },
    orderBy: { id: "asc" },
  });

  let created = 0;
  for (const b of bookings) {
    // mỗi booking chỉ 1 review
    const existed = await prisma.review.findUnique({
      where: { bookingId: b.id },
    });
    if (existed) continue;

    // điểm 4–5 sao, có chênh nhẹ giữa các chỉ số cho tự nhiên
    const overall = randint(4, 5);
    const jitter = () =>
      Math.max(1, Math.min(5, overall + (Math.random() < 0.3 ? -1 : 0)));

    await prisma.review.create({
      data: {
        bookingId: b.id,
        roomId: b.roomId,
        customerId: b.customerId ?? null,
        overall,
        amenities: jitter(),
        cleanliness: jitter(),
        comfort: jitter(),
        locationScore: randint(4, 5),
        valueForMoney: jitter(),
        hygiene: jitter(),
        comment: buildLongComment(),
        status: "PUBLISHED",
      },
    });
    created++;
  }

  console.log(
    `✅ Đã tạo ${created} review dài cho booking ONLINE CHECKED_OUT.`
  );
}

seedLongReviews()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
