import {
  DialogMode,
  HouseKeepingTask,
  TaskStatus,
  TaskType,
} from "@constant/types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ChipProps,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { formatDate } from "@utils/format";

const typeLabel: Record<TaskType, string> = {
  CLEANING: "Dọn phòng",
  INSPECTION: "Kiểm tra phòng",
};
interface Props {
  tasks: HouseKeepingTask[];
  onStatusChange: ({
    id,
    staffId,
    note,
    status,
    roomId,
  }: {
    id: number;
    staffId?: number;
    status?: TaskStatus;
    note?: string;
    roomId?: number;
  }) => void;
  onRowClick: (mode: DialogMode, id?: number) => void;
}
export default function HousekeepingTaskTable({
  tasks = [],
  onRowClick,
  onStatusChange,
}: Props) {
  return (
    <TableContainer component={Paper} className="rounded-xl shadow">
      <Table>
        {/* HEADER */}
        <TableHead sx={{ bgcolor: "#F6FCF9" }}>
          <TableRow>
            <TableCell className="font-semibold">Số Phòng</TableCell>
            <TableCell className="font-semibold">Người thực hiện</TableCell>
            <TableCell className="font-semibold">Loại nhiệm vụ</TableCell>
            <TableCell className="font-semibold">Trạng thái</TableCell>
            <TableCell className="font-semibold">Ngày tạo</TableCell>
          </TableRow>
        </TableHead>

        {/* BODY */}
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              hover
              onClick={
                task.status === "DONE"
                  ? () => onRowClick("view", task.id)
                  : () => onRowClick("edit", task.id)
              }
            >
              {/* ROOM */}
              <TableCell>
                <div className="font-medium">Phòng {task.room?.name}</div>
              </TableCell>

              {/* STAFF */}
              <TableCell>
                {task.staff ? (
                  task.staff.user?.fullName
                ) : (
                  <span className="text-gray-400 italic">
                    Chưa được phân công
                  </span>
                )}
              </TableCell>

              <TableCell>{typeLabel[task.type]}</TableCell>

              {/* STATUS */}
              {task.status === "DONE" ? (
                <TableCell>
                  <Typography>Hoàn thành</Typography>
                </TableCell>
              ) : (
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      onStatusChange({
                        id: task.id,
                        status: e.target.value as TaskStatus,
                      });
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="PENDING">Đang đợi</MenuItem>
                    <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                    <MenuItem value="DONE">Hoàn thành</MenuItem>
                  </TextField>
                </TableCell>
              )}

              {/* WORK DATE */}
              <TableCell>
                {formatDate(task.workDate, { withTime: true })}
              </TableCell>
            </TableRow>
          ))}

          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <div className="py-10 text-gray-400">No housekeeping tasks</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
