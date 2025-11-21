import { Footer, Header } from "@components";
import { Outlet } from "react-router-dom";
const DefaultLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
export default DefaultLayout;
