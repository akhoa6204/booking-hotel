import { Paper, Typography, Box, Skeleton, Rating } from "@mui/material";

type Props = {
  title: string;
  value: number;
  isStar?: boolean;
  loading?: boolean;
};

const StatCard: React.FC<Props> = ({
  title,
  value,
  isStar = false,
  loading,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: "#24AB70",
        flex: 1,
        minWidth: 260,
      }}
    >
      <Typography variant="body2" color="text.secondary" mb={1}>
        {title}
      </Typography>

      {loading ? (
        <Skeleton variant="text" width={160} height={36} />
      ) : (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" fontWeight={600}>
            {isStar ? `${value.toFixed(1)}/5` : value}
          </Typography>
          {isStar && (
            <Rating
              value={Number.isFinite(value) ? value : 0}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: "#FFD700" }}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;
