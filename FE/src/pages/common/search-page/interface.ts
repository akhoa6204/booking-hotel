import { SearchState } from "@constant/types";

export type SortKey = "price-asc" | "price-desc";

export type FormData = SearchState & {
  sort: SortKey;
};

export type GuestType = "SELF" | "OTHER";

export type BookingForm = {
  fullName: string;
  phone: string;
  email: string;
  guestType: GuestType;
  arrivalTime: string;
};
