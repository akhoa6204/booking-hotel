import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const Loading = ({ content }: { content?: string }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.5)",
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress sx={{ color: "#fff" }} />
        {content ? (
          <Typography color="#fff" fontWeight={500}>
            {content}
          </Typography>
        ) : (
          ""
        )}
      </Stack>
    </Box>
  );
};
export default Loading;
