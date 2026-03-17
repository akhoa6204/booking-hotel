import { HouseKeepingTask, TaskStatus, TaskType } from "@constant/types";
import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  List,
  ListItemButton,
  Button,
} from "@mui/material";
import { formatDate } from "@utils/format";
import Pager from "@components/pager";
import { Meta } from "@constant/response/paginated";
import { Add } from "@mui/icons-material";

type HousekeepingTabProps = {
  tasks?: HouseKeepingTask[];
  loadingDetail?: boolean;
  loadingList?: boolean;
  selectedTaskId?: number | null;
  selectedTask?: HouseKeepingTask | null;
  onSelectTask?: (id: number) => void;
  onUpdateTask: (id: number, status?: TaskStatus, note?: string) => void;
  canEdit: boolean;
  metaHousekeepingList: Meta;
  onChangePageHousekeeping: (page: number) => void;
  onCreateTask: () => void;
};

export default function HousekeepingTab({
  tasks = [],
  loadingDetail,
  loadingList,
  selectedTaskId,
  selectedTask,
  onSelectTask,
  onUpdateTask,
  canEdit,
  metaHousekeepingList,
  onChangePageHousekeeping,
  onCreateTask,
}: HousekeepingTabProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          spacing={2}
          flexWrap={"wrap"}
        >
          <Typography fontWeight={600} mb={1}>
            Danh sách công việc
          </Typography>
          {canEdit && (
            <Button
              variant="contained"
              sx={{ py: 0.25, px: 2, borderRadius: 1.5 }}
              onClick={onCreateTask}
            >
              <Add sx={{ fontSize: 20, marginRight: 0.5 }} />
              Thêm mới
            </Button>
          )}
        </Stack>
        {loadingList ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ height: 200 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">Đang tải dữ liệu...</Typography>
          </Stack>
        ) : tasks.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ height: 200 }}
          >
            <Typography variant="body2" color="text.secondary">
              Không có công việc buồng phòng
            </Typography>
          </Stack>
        ) : (
          <List sx={{ height: 360 }}>
            {tasks.map((t) => (
              <ListItemButton
                key={t.id}
                onClick={() => onSelectTask?.(t.id)}
                selected={t.id === selectedTaskId}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Typography fontWeight={500}>
                  {t.type === "CLEANING" ? "Dọn phòng" : "Kiểm tra phòng"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(t.workDate, true)}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        )}
        {metaHousekeepingList?.totalPages > 1 && (
          <Box display="flex" justifyContent="center">
            <Pager
              totalPages={metaHousekeepingList.totalPages}
              page={metaHousekeepingList.page}
              onChange={onChangePageHousekeeping}
            />
          </Box>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        {loadingDetail ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ mt: 6 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">Đang tải dữ liệu...</Typography>
          </Stack>
        ) : (
          selectedTask &&
          selectedTaskId && (
            <Stack spacing={3}>
              <Typography fontWeight={600}>Danh sách công việc</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Loại công việc
                  </Typography>
                  <Typography>
                    {selectedTask.type === "CLEANING"
                      ? "Dọn phòng"
                      : "Kiểm tra phòng"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Trạng thái
                  </Typography>
                  <TextField
                    select
                    size="small"
                    disabled={!canEdit}
                    value={selectedTask.status}
                    onChange={(e) =>
                      onUpdateTask(
                        selectedTask.id,
                        e.target.value as TaskStatus,
                        null,
                      )
                    }
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="PENDING">Chờ thực hiện</MenuItem>
                    <MenuItem value="IN_PROGRESS">Đang kiểm tra</MenuItem>
                    <MenuItem value="DONE">Hoàn thành</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nhân viên phụ trách
                  </Typography>
                  <Typography>
                    {selectedTask.staff?.user.fullName ?? "Chưa phân công"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ngày làm việc
                  </Typography>
                  <Typography>
                    {formatDate(
                      selectedTask.updatedAt || selectedTask.workDate,
                      true,
                    )}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ghi chú buồng phòng
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={!canEdit}
                    placeholder="Nhập ghi chú buồng phòng..."
                    value={selectedTask.note || ""}
                    onChange={(e) =>
                      onUpdateTask(selectedTask.id, null, e.target.value)
                    }
                  />
                </Paper>
              </Box>
            </Stack>
          )
        )}
      </Grid>
    </Grid>
  );
}
