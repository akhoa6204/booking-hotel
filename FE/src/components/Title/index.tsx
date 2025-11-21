import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  subTitle: string;
  onAdd?: () => void;
};

const Title = ({ title, subTitle, onAdd }: Props) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Box>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subTitle}
        </Typography>
      </Box>
      {onAdd ? (
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            color="primary"
            onClick={onAdd}
          >
            Thêm mới
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
};

export default Title;
