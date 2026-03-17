import { prisma } from "../../lib/prisma.js";
import { buildOffsetMeta, parsePageLimit } from "../../utils/pagination.js";
import { success, bad } from "../../utils/response.js";

export async function list(req, res) {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const isManager = role === "ADMIN" || role === "MANAGER";

    const { startDate, endDate, q, position } = req.query;

    if (!startDate || !endDate) {
      return bad(res, "Thiếu startDate hoặc endDate", 400);
    }
    const staffId = (
      await prisma.staff.findUnique({
        where: {
          userId: userId,
          user: { isActive: true },
        },
      })
    ).id;

    const nameQuery = q?.trim();

    const managerPositions = ["MANAGER", "RECEPTION", "HOUSEKEEPING"];

    const staffWhere = isManager
      ? {
          position: {
            in: position ? [position] : managerPositions,
          },
          user: {
            isActive: true,
            ...(nameQuery
              ? {
                  fullName: {
                    contains: nameQuery,
                  },
                }
              : {}),
          },
          isAdmin: false,
        }
      : {
          id: staffId,
          user: { isActive: true },
        };

    const staffs = await prisma.staff.findMany({
      where: staffWhere,
      select: {
        id: true,
        position: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const assignments = await prisma.staffShiftAssignment.findMany({
      where: {
        workDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(isManager ? {} : { staffId }),
      },
      select: {
        id: true,
        staffId: true,
        workDate: true,
        position: true,
        shift: {
          select: {
            id: true,
            code: true,
            name: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    const assignmentMap = {};

    for (const assignment of assignments) {
      if (!assignmentMap[assignment.staffId]) {
        assignmentMap[assignment.staffId] = [];
      }
      assignmentMap[assignment.staffId].push(assignment);
    }

    const grouped = staffs.map((staff) => ({
      ...staff,
      assignments: assignmentMap[staff.id] || [],
    }));

    return success(res, grouped);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function create(req, res) {
  try {
    const role = req.user.role;

    const isManager = role === "ADMIN" || role === "MANAGER";

    const { workDate, staffId, shiftId } = req.body || {};
    if (!workDate || !staffId || !shiftId) {
      return bad(res, "Thông tin workdate, staffId, shiftId là bắt buộc", 400);
    }
    if (!isManager) {
      return bad(res, "Bạn không có quyền tạo lịch làm", 403);
    }

    const staff = await prisma.staff.findUnique({
      where: { id: Number(staffId) },
    });

    if (!staff) {
      return bad(res, "Nhân viên không tồn tại", 404);
    }

    const shift = await prisma.shift.findUnique({
      where: { id: Number(shiftId) },
    });

    if (!shift) {
      return bad(res, "Ca làm không tồn tại", 404);
    }

    const workDateObj = new Date(workDate);

    const existed = await prisma.staffShiftAssignment.findFirst({
      where: {
        staffId: Number(staffId),
        workDate: workDateObj,
        shiftId: Number(shiftId),
      },
    });

    if (existed) {
      return bad(res, "Nhân viên đã có tồn tại ca làm đang được khởi tạo", 400);
    }

    const created = await prisma.staffShiftAssignment.create({
      data: {
        staffId: Number(staffId),
        workDate: workDateObj,
        shiftId: Number(shiftId),
        position: staff.position,
      },
    });

    return success(res, created, 201);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const role = req.user.role;

    const isManager = role === "ADMIN" || role === "MANAGER";

    if (!isManager) {
      return bad(res, "Bạn không có quyền tạo lịch làm", 403);
    }
    if (!id) {
      return bad(res, "Thiếu thông tin Id", 400);
    }

    const existed = await prisma.staffShiftAssignment.findUnique({
      where: { id: Number(id) },
    });

    if (!existed) {
      return bad(res, "Lịch làm không tồn tại", 404);
    }

    await prisma.staffShiftAssignment.delete({
      where: { id: Number(id) },
    });

    return success(res, null, 200);
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}

export async function listShift(req, res) {
  try {
    const { page, limit, skip } = parsePageLimit(req, { maxLimit: 100 });

    const [shifts, total] = await prisma.$transaction([
      prisma.shift.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          startTime: true,
          endTime: true,
        },
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.shift.count(),
    ]);

    return success(
      res,
      { items: shifts, meta: buildOffsetMeta({ page, limit, total }) },
      200,
    );
  } catch (e) {
    console.error(e);
    return bad(res, "Có lỗi xảy ra", 500);
  }
}
