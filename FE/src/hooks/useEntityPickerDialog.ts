import { useCallback, useState } from "react";

export const useEntityPicker = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const openPicker = () => setOpen(true);
  const closePicker = () => setOpen(false);

  const select = (row: any) => {
    setSelectedId(row.id);
    setSelectedRow(row);
  };
  const resetEntityPicker = () => {
    setSelectedId(null);
    setSelectedRow(null);
  };

  const mergeOptions = useCallback(
    (options: any[]) => {
      if (!selectedRow) return options;

      const exist = options.some((o) => o.id === selectedRow.id);

      if (exist) return options;

      return [selectedRow, ...options];
    },
    [selectedRow],
  );

  return {
    selectedId,
    selectedRow,
    setSelectedId,
    open,
    openPicker,
    closePicker,
    select,
    mergeOptions,
    resetEntityPicker,
  };
};
