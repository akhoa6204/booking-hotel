import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { TitlePageAdmin as Title } from "@components";
import Pager from "@components/pager";
import StatCard from "./components/StatCard";
import useReviewManagement from "./useReview";
import ReviewCard from "./components/ReviewCard";

export default function ReviewManagement() {
  const {
    // list
    rows,
    totalPages,
    currentPage,
    isLoading,

    // filters
    filters,
    handleSearch,
    handleChangePage,
    handleChangeFilter, // reserved nếu sau này lọc theo phòng/trạng thái

    // stats
    stats,
    statsLoading,

    // actions
    onPublish,
    onHide,
  } = useReviewManagement();

  return (
    <Box>
      <Title
        title="Quản lý đánh giá"
        subTitle="Xem và quản lý đánh giá từ khách hàng"
      />

      {/* Stats */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <StatCard
          title="Đánh giá trung bình"
          value={Number(stats?.average ?? 0)}
          isStar
          loading={statsLoading}
        />
        <StatCard
          title="Tổng đánh giá"
          value={Number(stats?.total ?? 0)}
          loading={statsLoading}
        />
        <StatCard
          title="Đánh giá ẩn"
          value={Number(stats?.hidden ?? 0)}
          loading={statsLoading}
        />
      </Stack>

      {/* Filters */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo khách hàng, tên phòng ..."
          value={filters.q}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* List */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
        <Typography fontSize={20} fontWeight={600} mb={2}>
          Danh sách đánh giá
        </Typography>

        {isLoading ? (
          <Typography color="text.secondary">Đang tải…</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">
            Chưa có đánh giá phù hợp bộ lọc.
          </Typography>
        ) : (
          <>
            {rows.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onToggleStatus={(id, next) =>
                  next === "PUBLISHED" ? onPublish(id) : onHide(id)
                }
              />
            ))}

            {totalPages > 1 && (
              <Box mt={2} display="flex" justifyContent="center">
                <Pager
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={handleChangePage}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
