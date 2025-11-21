import { Box, Card, Tabs, Tab, Typography } from "@mui/material";
import useAccountProfilePage from "./useAccountProfilePage";
import GlobalSnackbar from "@components/GlobalSnackbar";
import InfoTab from "./components/info";
import ChangePasswordTab from "./components/change-password";

const AccountProfilePage = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    infoTabProps,
    changePasswordTabProps,
    alert,
    closeSnackbar,
  } = useAccountProfilePage();

  if (!user || !infoTabProps) return null;
  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
          p: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Hồ sơ của tôi
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Tab
            value="info"
            label="Thông tin cá nhân"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            value="security"
            label="Mật khẩu và bảo mật"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>

        <Box>
          {activeTab === "info" && <InfoTab {...infoTabProps} />}

          {activeTab === "security" && (
            <ChangePasswordTab {...changePasswordTabProps} />
          )}
        </Box>
      </Card>
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default AccountProfilePage;
