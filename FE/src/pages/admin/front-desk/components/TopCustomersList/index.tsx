// pages/admin/dashboard/components/TopCustomersList.tsx
import { TopCustomers } from "@constant/types";
import { Paper, Box, Typography, Avatar, Divider } from "@mui/material";
import { formatMoneyShort } from "@utils/format";

export default function TopCustomersList({
  data,
  loading,
}: {
  data?: TopCustomers;
  loading?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 1.5 }}>
        Top khách hàng
      </Typography>

      {loading ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Đang tải…
        </Typography>
      ) : !data?.items?.length ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Không có dữ liệu
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {data.items.map((c, idx) => (
            <Box
              key={`${c.rank}-${c.name}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                border: "1px solid",
                borderColor: "#24AB70",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#24AB70",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {c.rank}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  <Typography variant="body2" color="primary">
                    {c.bookings} booking
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontWeight: 700 }} color="primary">
                {formatMoneyShort(c.totalPaid)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
