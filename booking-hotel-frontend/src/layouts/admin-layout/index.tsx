import { AdminSideBar } from "@components";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2 sticky top-0 h-screen">
        <AdminSideBar />
      </div>
      <div className="col-span-10 px-5 py-5">
        <Outlet />
      </div>
    </div>
  );
};
export default AdminLayout;
