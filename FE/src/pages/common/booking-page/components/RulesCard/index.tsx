import { Box, List, ListItem, Paper, Typography } from "@mui/material";

const RulesCard = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
      variant="outlined"
    >
      <Typography variant="h6" fontWeight={700} mb={1.5}>
        Xem lại quy tắc chung
      </Typography>

      <Typography variant="body2" mb={1}>
        Chủ chỗ nghỉ muốn bạn đồng ý với các quy tắc chung này:
      </Typography>

      <List dense sx={{ mb: 1, pl: 2 }}>
        <ListItem
          sx={{ display: "list-item", listStyleType: "disc", pl: 0, py: 0.5 }}
        >
          <Typography variant="body2">
            Thời gian yên lặng từ{" "}
            <Box component="span" fontWeight={600}>
              22:00 đến 06:00
            </Box>
          </Typography>
        </ListItem>
        <ListItem
          sx={{ display: "list-item", listStyleType: "disc", pl: 0, py: 0.5 }}
        >
          <Typography variant="body2">Không cho phép thú cưng</Typography>
        </ListItem>
      </List>

      <Typography variant="body2" fontWeight={600}>
        Khi tiếp tục các bước tiếp theo, bạn đồng ý với các quy tắc chung này.
      </Typography>
    </Paper>
  );
};

export default RulesCard;
