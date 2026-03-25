import { useMemo } from "react";
import { Box, Typography, IconButton, Paper, Grid } from "@mui/material";
import { Add, ArrowBack, ArrowForward, Close } from "@mui/icons-material";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Employee, StaffShiftAssignment, UserRole } from "@constant/types";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(isoWeek);
import "dayjs/locale/vi";
import { formatTime } from "@utils/format";
dayjs.locale("vi");

type Props = {
  shifts: {
    user: Employee;
    assignments: StaffShiftAssignment[];
  }[];
  start: string;
  onAdd?: (staff: Employee) => void;
  onRemove: (id: number) => void;
  canEdit: boolean;
};

const getShiftColor = (role?: Omit<UserRole, "CUSTOMER">) => {
  switch (role) {
    case "RECEPTION":
      return { bg: "#E3F2FD", border: "#1565C0" };
    case "HOUSEKEEPING":
      return { bg: "#E8F5E9", border: "#2E7D32" };
    case "MANAGER":
      return { bg: "#FFF3E0", border: "#EF6C00" };
    default:
      return { bg: "#F3E5F5", border: "#6A1B9A" };
  }
};
const getPositionLabel = (position: Omit<UserRole, "CUSTOMER">) => {
  switch (position) {
    case "RECEPTION":
      return "Lễ tân";
    case "HOUSEKEEPING":
      return "Dọn phòng";
    case "MANAGER":
      return "Quản lý";
    default:
      return "Không xác định";
  }
};

export default function WeeklyScheduleCalendar({
  shifts,
  start,
  onAdd,
  onRemove,
  canEdit = false,
}: Props) {
  const weekDays = useMemo(() => {
    const startDate = dayjs(start, "YYYY-MM-DD").startOf("day");

    return Array.from({ length: 7 }).map((_, i) => startDate.add(i, "day"));
  }, [start]);

  const getAssignmentsByDate = (
    assignments: StaffShiftAssignment[],
    date: string,
  ) => {
    return assignments.filter(
      (a) => dayjs(a.workDate).format("YYYY-MM-DD") === date,
    );
  };

  return (
    <Box p={3}>
      <Paper elevation={1} sx={{ borderRadius: 3 }}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Grid container direction="column">
            {/* HEADER */}
            <Grid container wrap="nowrap" sx={{ backgroundColor: "#F6FCF9" }}>
              <Grid
                sx={{
                  flex: "0 0 200px",
                  p: 2,
                  borderRight: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  backgroundColor: "#F6FCF9",
                }}
              >
                Nhân viên
              </Grid>

              {weekDays.map((day) => (
                <Grid
                  key={day.toString()}
                  sx={{
                    flex: "0 0 150px",
                    p: 2,
                    borderRight: "1px solid #ddd",
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {day.format("dddd")}
                  <br />
                  <Typography variant="caption">
                    {day.format("DD/MM")}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* STAFF ROWS */}
            {shifts?.map((item) => (
              <Grid container wrap="nowrap" key={item.user.staff.id}>
                <Grid
                  sx={{
                    flex: "0 0 200px",
                    p: 2,
                    borderRight: "1px solid #ddd",
                    borderBottom: "1px solid #eee",
                    fontWeight: 500,
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: "#fff",
                  }}
                >
                  {item.user.fullName}
                  <br />
                  <small>{getPositionLabel(item.user.staff.position)}</small>
                </Grid>

                {weekDays.map((day) => {
                  const assignmentsOfDay = getAssignmentsByDate(
                    item.assignments || [],
                    day.format("YYYY-MM-DD"),
                  );

                  return (
                    <Grid
                      key={day.toString()}
                      className="group flex flex-col"
                      sx={{
                        flex: "0 0 150px",
                        p: 1,
                        borderRight: "1px solid #ddd",
                        borderBottom: "1px solid #eee",
                        minHeight: 100,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {assignmentsOfDay.map((a) => {
                        const color = getShiftColor(a.position);

                        return (
                          <Box
                            key={a.id}
                            className="group/shift flex flex-col relative"
                            sx={{
                              mb: 1,
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              background: color.bg,
                              border: `1.5px solid ${color.border}`,
                            }}
                          >
                            <Typography fontSize={13} fontWeight={600}>
                              {a.shift.name}
                            </Typography>

                            <Typography fontSize={12}>
                              {formatTime(a.shift.startTime)} -
                              {formatTime(a.shift.endTime)}
                            </Typography>

                            <Typography fontSize={12}>{a.position}</Typography>
                            {canEdit && (
                              <Box className="flex justify-end opacity-0 group-hover/shift:opacity-100 transition absolute top-0 right-0">
                                <IconButton
                                  size="small"
                                  onClick={() => onRemove(a.id)}
                                >
                                  <Close sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                      {canEdit &&
                        (assignmentsOfDay.length === 0 ? (
                          <Box
                            onClick={() =>
                              onAdd?.(item.user)
                            }
                            className="opacity-0 group-hover:opacity-100 cursor-pointer"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "#24AB70",
                              color: "white",
                              borderRadius: 3,
                              flex: 1,
                              width: "full",
                            }}
                          >
                            <Add sx={{ fontSize: 18 }} />
                          </Box>
                        ) : (
                          <Box
                            onClick={() =>
                              onAdd?.(item.user)
                            }
                            className="opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "#24AB70",
                              color: "white",
                              borderRadius: 3,
                              width: "full",
                              p: 0.5,
                            }}
                          >
                            <Add sx={{ fontSize: 14 }} />
                          </Box>
                        ))}
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
