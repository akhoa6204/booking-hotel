import { ReactNode } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Pager } from "@components";
import { Meta } from "@constant/response/paginated";

type PagedSectionProps<T> = {
  title: string;
  items: T[];
  meta?: Meta;
  loading?: boolean;
  emptyText?: string;
  renderItem: (item: T, index: number) => ReactNode;
  onChangePage?: (page: number) => void;
  footerSlot?: ReactNode;
};

export default function PagedSection<T>({
  title,
  items,
  meta,
  loading = false,
  emptyText = "Không có dữ liệu.",
  renderItem,
  onChangePage,
  footerSlot,
}: PagedSectionProps<T>) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2.5, height: "100%" }} variant="outlined">
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>

          {meta?.total !== undefined && (
            <Chip
              label={`${meta.total} bookings`}
              size="small"
              sx={{
                fontWeight: 500,
                color: "#1E40AF",
                borderColor: "#93C5FD",
                backgroundColor: "#EFF6FF",
                borderWidth: 1,
                borderStyle: "solid",
              }}
            />
          )}
        </Stack>

        {/* BODY */}
        {loading ? (
          <Box py={4} display="flex" justifyContent="center">
            <CircularProgress size={22} />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid #eee" }} />}>
            {items.map((it, idx) => (
              <Box key={idx} py={1}>
                {renderItem(it, idx)}
              </Box>
            ))}
          </Stack>
        )}

        {/* FOOTER */}
        {footerSlot}

        {meta && meta.totalPages > 1 && onChangePage && (
          <Box mt={0.5} display="flex" justifyContent="center">
            <Pager
              page={meta.page}
              totalPages={meta.totalPages}
              onChange={onChangePage}
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
