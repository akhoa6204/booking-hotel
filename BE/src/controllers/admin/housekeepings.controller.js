import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { bad, success } from "../../utils/response.js";
import { getIO } from "../../lib/socket.js";

export async function list(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const notHouseKeeping = role !== "HOUSEKEEPING";

    const { page, limit, skip } = parsePageLimit(req, { maxLimit: 100 });

    const { q = "", status, bookingId } = req.query || {};

    if (status && !["IN_PROGRESS", "PENDING", "DONE"].includes(status))
      return bad(res, "Trạng thái không hợp lệ", 400);

    const staffId = (
      await prisma.staff.findUnique({ where: { userId: Number(userId) } })
    ).id;

    const searchConditions = q
      ? {
          OR: [
            {
              room: {
                name: {
                  contains: q,
                },
              },
            },
            {
              staff: {
                user: {
                  fullName: {
                    contains: q,
                  },
                },
              },
            },
          ].filter(Boolean),
        }
      : {};

    const where = notHouseKeeping
      ? {
          ...searchConditions,
          ...(status ? { status } : {}),
          ...(bookingId ? { bookingId: Number(bookingId) } : {}),
        }
      : {
          staffId,
          ...searchConditions,
          ...(status ? { status } : {}),
          ...(bookingId ? { bookingId: Number(bookingId) } : {}),
        };

    const [tasks, total] = await prisma.$transaction([
      prisma.housekeepingTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { workDate: "desc" },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              roomType: {
                select: {
                  name: true,
                },
              },
            },
          },
          staff: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.housekeepingTask.count({
        where,
      }),
    ]);

    return success(
      res,
      { items: tasks, meta: buildOffsetMeta({ page, limit, total }) },
      200,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Thiếu thông tin ID", 400);
    const userId = req.user.id;
    
    const { status, staffId, note, roomId, type } = req.body || {};
    
    if (status && !["IN_PROGRESS", "PENDING", "DONE"].includes(status))
      return bad(res, "Trạng thái không hợp lệ", 400);

    if (staffId) {
      const existedStaff = await prisma.staff.findUnique({
        where: { id: Number(staffId), position: "HOUSEKEEPING" },
      });
      if (!existedStaff) return bad(res, "Không tồn tại nhân viên", 400);
    }
    const existedTask = await prisma.housekeepingTask.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existedTask) return bad(res, "Không tồn tại nhiệm vụ dọn phòng", 400);

    let autoStaffId = null;

    if (!staffId && !existedTask.staffId) {
      const staff = await prisma.staff.findUnique({
        where: { userId: Number(userId) },
        select: { id: true },
      });

      if (staff) {
        autoStaffId = staff.id;
      }
    }

    const updateData = {};

    if (status) updateData.status = status;
    if (typeof note !== "undefined") updateData.note = note;

    if (staffId) {
      updateData.staffId = Number(staffId);
    } else if (autoStaffId) {
      updateData.staffId = autoStaffId;
    }

    if (roomId) {
      updateData.roomId = Number(roomId);
    }

    if (type && ["INSPECTION", "CLEANING"].includes(type)) {
      updateData.type = type;
    }

    const updated = await prisma.housekeepingTask.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            roomType: {
              select: {
                name: true,
              },
            },
          },
        },
        staff: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (
      status === "DONE" &&
      existedTask.type === "INSPECTION" &&
      existedTask.bookingId
    ) {
      try {
        const io = getIO();
        io.to(`booking_${existedTask.bookingId}`).emit("room_inspected", {
          bookingId: existedTask.bookingId,
          roomId: existedTask.roomId,
        });
      } catch (err) {
        console.error("Socket emit failed:", err);
      }
    }

    if (status === "DONE" && existedTask.type === "CLEANING") {
      try {
        const room = await prisma.room.findUnique({
          where: { id: existedTask.roomId },
          select: { status: true },
        });

        if (room?.status === "OUT_OF_SERVICE") {
          return success(res, null, 200);
        }

        const activeBooking = await prisma.booking.findFirst({
          where: {
            roomId: existedTask.roomId,
            status: "CHECKED_IN",
          },
        });

        if (activeBooking) {
          // Phòng đang có khách -> OCCUPIED_CLEAN
          await prisma.room.update({
            where: { id: existedTask.roomId },
            data: {
              status: "OCCUPIED_CLEAN",
            },
          });
        } else {
          // Không có khách -> VACANT_CLEAN
          await prisma.room.update({
            where: { id: existedTask.roomId },
            data: {
              status: "VACANT_CLEAN",
            },
          });
        }
      } catch (err) {
        console.error("Update room status after cleaning failed:", err);
      }
    }

    return success(res, updated, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function create(req, res) {
  try {
    const { bookingId, roomId, type, staffId } = req.body || {};

    if (!["INSPECTION", "CLEANING"].includes(type))
      return bad(res, "Không tồn tại loại type này", 400);

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
      if (!booking) return bad(res, "Không tồn tại đặt phòng", 400);
    }

    if (type === "INSPECTION" && bookingId) {
      const existedInspection = await prisma.housekeepingTask.findFirst({
        where: {
          bookingId: Number(bookingId),
          type: "INSPECTION",
        },
      });

      if (existedInspection) {
        return bad(res, "Đặt phòng này đã có nhiệm vụ kiểm tra", 400);
      }
    }

    if (type === "CLEANING" && roomId) {
      const existedCleaning = await prisma.housekeepingTask.findFirst({
        where: {
          roomId: Number(roomId),
          type: "CLEANING",
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      });

      if (existedCleaning) {
        return bad(
          res,
          "Phòng này đang có nhiệm vụ dọn phòng chưa hoàn thành",
          400,
        );
      }
    }

    if (!roomId) return bad(res, "Thiếu thông tin phòng", 400);

    const now = new Date();
    const today = new Date(now.toISOString().slice(0, 10));

    let assignedStaffId = staffId ? Number(staffId) : null;

    if (!assignedStaffId) {
      const currentShift = await prisma.shift.findFirst({
        where: {
          startTime: { lte: now },
          endTime: { gt: now },
        },
      });

      if (currentShift) {
        const staffOnShift = await prisma.staffShiftAssignment.findMany({
          where: {
            workDate: today,
            shiftId: currentShift.id,
            position: "HOUSEKEEPING",
          },
        });

        if (staffOnShift.length > 0) {
          const taskCounts = await Promise.all(
            staffOnShift.map(async (s) => {
              const count = await prisma.housekeepingTask.count({
                where: {
                  staffId: s.staffId,
                  status: { in: ["PENDING", "IN_PROGRESS"] },
                },
              });
              return { staffId: s.staffId, count };
            }),
          );

          taskCounts.sort((a, b) => a.count - b.count);
          assignedStaffId = taskCounts[0].staffId;
        }
      }
    }

    const taskData = {
      ...(bookingId ? { bookingId } : {}),
      roomId,
      type,
      workDate: now,
    };

    if (assignedStaffId) taskData.staffId = assignedStaffId;

    const task = await prisma.housekeepingTask.create({
      data: taskData,
    });

    return success(res, task, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params || {};
    if (!id) return bad(res, "Thiếu thông tin ID", 400);

    const task = await prisma.housekeepingTask.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        workDate: true,
        type: true,
        status: true,
        note: true,
        updatedAt: true,
        staff: {
          select: {
            id: true,
            position: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            roomType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task) return bad(res, "Không tồn tại dọn phòng", 400);
    return success(res, task, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}
