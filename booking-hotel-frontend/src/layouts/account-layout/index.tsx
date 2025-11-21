import { Header } from "@components";
import AccountSidebar from "@components/account-sidebar";
import { Container, Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
const AccountLayout = () => {
  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-[92vh]">
        <Container>
          <Grid container spacing={2.5} py={2.5}>
            <Grid size={3}>
              <AccountSidebar />
            </Grid>
            <Grid size={9}>
              <Outlet />
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};
export default AccountLayout;
