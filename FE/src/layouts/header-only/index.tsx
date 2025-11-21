import { Header } from "@components";
import { Outlet } from "react-router-dom";
const HeaderOnlyLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};
export default HeaderOnlyLayout;
