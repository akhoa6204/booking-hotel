import Title from "@components/Title";
import ShiftService from "@services/ShiftService";
import { QueryClient, useQuery } from "@tanstack/react-query";
import useShift from "./useShift";
import WeeklyScheduleCalendar from "./components/weekly-schedule-calendar";
import GlobalSnackbar from "@components/GlobalSnackbar";
import CreateShiftDialog from "./components/create-shift-dialog";

const ShiftManagement = () => {
  const {
    shifts,
    shiftDefinitions,
    nextWeek,
    prevWeek,
    start,
    end,
    onRemove,
    canEdit,
    alert,
    closeSnackbar,

    form,
    openDialog,
    closeDialog,
    onSubmit,
    open,
    onChangeForm,
  } = useShift();
  return (
    <>
      <Title
        title="Quản lý lịch phân ca nhân viên"
        subTitle="Theo dõi và sắp xếp ca làm việc theo tuần"
      />
      <WeeklyScheduleCalendar
        shifts={shifts}
        start={start}
        end={end}
        nextWeek={nextWeek}
        prevWeek={prevWeek}
        onRemove={onRemove}
        onAdd={openDialog}
        canEdit={canEdit}
      />
      <CreateShiftDialog
        shifts={shiftDefinitions}
        open={open}
        onClose={closeDialog}
        workDate={form.workDate}
        shiftId={form.shiftId}
        onChangeShift={onChangeForm}
        staff={form.staff}
        onSubmit={onSubmit}
      />

      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default ShiftManagement;
