import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RoomTypeService from "@services/RoomTypeService";
import RoomService from "@services/RoomService";
import { RoomStatus, RoomType } from "@constant/types";

/* =================== FILTER TYPES =================== */
type RoomFilter = {
  hotelId?: number;
  searchKeyword?: string;
  roomTypeId?: number;
  currentPage: number;
  pageSize: number;
};

const defaultRoomFilter: RoomFilter = {
  hotelId: 1,
  searchKeyword: "",
  roomTypeId: undefined,
  currentPage: 1,
  pageSize: 6,
};

/* =================== FORM TYPE =================== */
type UpsertFormRoom = {
  hotelId: number;
  roomTypeId: number | "";
  name: string;
  description?: string;
  status?: RoomStatus;
};

export default function useRoomManagement() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<RoomFilter>(defaultRoomFilter);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<UpsertFormRoom>({
    hotelId: 1,
    roomTypeId: "",
    name: "",
    description: "",
    status: "AVAILABLE",
  });

  /* =================== FETCH ROOM TYPES =================== */
  const {
    data: roomTypeResponse,
    isLoading: isRoomTypeLoading,
    isError: isRoomTypeError,
    error: roomTypeError,
  } = useQuery({
    queryKey: ["roomTypes", filters.hotelId],
    queryFn: async () =>
      await RoomTypeService.list({ hotelId: filters.hotelId }),
    staleTime: 30_000,
  });

  const roomTypes: RoomType[] = roomTypeResponse?.items ?? [];

  /* =================== FETCH ROOM LIST =================== */
  const {
    data: roomResponse,
    isLoading: isRoomLoading,
    isFetching: isRoomFetching,
  } = useQuery({
    queryKey: ["rooms", filters],
    queryFn: async () =>
      RoomService.list({
        hotelId: filters.hotelId,
        q: filters.searchKeyword,
        roomTypeId: filters.roomTypeId,
        page: filters.currentPage,
        limit: filters.pageSize,
      }),
    staleTime: 10_000,
  });

  const rooms = roomResponse?.items ?? [];
  const paginationMetadata = roomResponse?.meta;

  /* =================== FETCH ROOM DETAIL =================== */
  const { data: roomDetail, isFetching: isRoomDetailLoading } = useQuery({
    queryKey: ["room", editingRoomId],
    queryFn: () => RoomService.get(editingRoomId!),
    enabled: !!editingRoomId && isDialogOpen,
  });
  console.log(roomDetail);

  // Khi mở dialog edit -> fill form
  useEffect(() => {
    if (editingRoomId && roomDetail) {
      setFormValues({
        hotelId: roomDetail.hotelId,
        roomTypeId: roomDetail.roomTypeId,
        name: roomDetail.name,
        description: roomDetail.description ?? "",
        status: roomDetail.status as RoomStatus,
      });
    }
  }, [roomDetail, editingRoomId]);

  /* =================== FILTER ACTIONS =================== */
  const updateFilters = useCallback(
    (newFilters: Partial<RoomFilter>) =>
      setFilters((prev) => ({ ...prev, ...newFilters })),
    []
  );

  const handleSelectRoomType = (roomTypeId?: number) =>
    updateFilters({ roomTypeId, currentPage: 1 });

  const handleSearchByName = (keyword: string) =>
    updateFilters({ searchKeyword: keyword, currentPage: 1 });

  const handleChangePage = (pageNumber: number) =>
    updateFilters({ currentPage: pageNumber });

  /* =================== DIALOG ACTIONS =================== */
  const resetForm = (hotelId?: number) => {
    setFormValues({
      hotelId: hotelId ?? filters.hotelId ?? 1,
      roomTypeId: roomTypes[0]?.id ?? "",
      name: "",
      description: "",
      status: "AVAILABLE",
    });
  };

  const openCreateDialog = () => {
    setEditingRoomId(null);
    resetForm(filters.hotelId);
    setIsDialogOpen(true);
  };

  const openEditDialog = (roomId: number) => {
    setEditingRoomId(roomId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRoomId(null);
    resetForm(filters.hotelId);
  };

  const handleFormChange = (field: keyof UpsertFormRoom, value: any) =>
    setFormValues((prev) => ({ ...prev, [field]: value }));

  /* =================== CREATE / UPDATE MUTATIONS =================== */
  const createMutation = useMutation({
    mutationFn: (payload: UpsertFormRoom) =>
      RoomService.create({
        hotelId: payload.hotelId,
        roomTypeId: Number(payload.roomTypeId),
        name: payload.name,
        description: payload.description,
        status: payload.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: number; payload: UpsertFormRoom }) =>
      RoomService.update(args.id, {
        name: args.payload.name,
        description: args.payload.description,
        status: args.payload.status,
        roomTypeId:
          args.payload.roomTypeId != null
            ? Number(args.payload.roomTypeId)
            : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      closeDialog();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (args: { id: number }) => RoomService.toggleActive(args.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const submitUpsert = async () => {
    if (!formValues.name || !formValues.roomTypeId) return;

    if (editingRoomId) {
      await updateMutation.mutateAsync({
        id: editingRoomId,
        payload: formValues,
      });
    } else {
      await createMutation.mutateAsync(formValues);
    }
  };

  const toggleActive = async (id: number) => {
    await toggleActiveMutation.mutateAsync({ id });
  };

  /* =================== UI HELPERS =================== */
  const roomTypeLabels = useMemo(
    () => roomTypes.map((t) => t.name),
    [roomTypes]
  );

  const activeTabValue = useMemo(() => {
    const selectedType = roomTypes.find(
      (t) => t.id === filters.roomTypeId
    )?.name;
    return selectedType || "ALL";
  }, [filters.roomTypeId, roomTypes]);

  const handleChangeTab = (tabLabel: string) => {
    const selectedTypeId =
      tabLabel === "ALL"
        ? undefined
        : roomTypes.find((t) => t.name === tabLabel)?.id;
    handleSelectRoomType(selectedTypeId);
  };

  return {
    // Data
    rooms,
    roomTypes,
    paginationMetadata,
    formValues,

    // Filters
    filters,
    handleSearchByName,
    handleChangeTab,
    handleChangePage,

    // Dialog
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,

    // Form
    handleFormChange,
    submitUpsert,
    toggleActive,

    // Loading
    isRoomLoading: isRoomLoading || isRoomFetching || isRoomTypeLoading,
    isSubmitting: createMutation.isPending || updateMutation.isPending,

    // UI helpers
    roomTypeLabels,
    activeTabValue,
    isRoomTypeError,
    roomTypeError,
  };
}
