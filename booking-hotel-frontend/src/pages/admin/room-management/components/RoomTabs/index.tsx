import { Tabs, Tab, Box } from "@mui/material";

type Props = {
  types: string[];
  value: string;
  onChange: (val: string) => void;
};

const RoomTabs: React.FC<Props> = ({ types, value, onChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="room type tabs"
        sx={{
          ".MuiTab-root": { textTransform: "none", minHeight: 44 },
          ".Mui-selected": { color: "primary.main !important" },
          ".MuiTabs-indicator": { bgcolor: "primary.main" },
        }}
      >
        <Tab label="Tất cả" value="ALL" />
        {types.map((t) => (
          <Tab key={t} label={t} value={t} />
        ))}
      </Tabs>
    </Box>
  );
};
export default RoomTabs;
