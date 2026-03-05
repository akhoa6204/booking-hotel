export interface SearchState {
  from: string;
  to: string;
  capacity?: number;
}

export interface FormBooking {
  from: string;
  to: string;
  capacity: number;
}
export type Errors<T> = Partial<Record<keyof T, string>>;
export type UserRole =
  | "MANAGER"
  | "CUSTOMER"
  | "ADMIN"
  | "RECEPTION"
  | "HOUSEKEEPING";
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export type AmenityItem = {
  amenityId: number;
};

export type Amenity = {
  id: number;
  code: string;
  label: string;
};
export type Image = {
  id: number;
  url: string;
  isPrimary: boolean;
};
export type RoomType = {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  description?: string;
  amenities: Amenity[];
  rooms?: { id: number; name: string; status: string }[];
  images?: Image[];
};

export type RoomTypeGuest = Omit<RoomType, "rooms"> & { image: string };

export type RoomStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "CLEANING";

export type Room = {
  id: number;
  name: string;
  description?: string | null;
  status: RoomStatus;
  roomType: RoomType;
};

export type PromoScope = "GLOBAL" | "ROOM_TYPE" | "MIN_TOTAL";
export type PromoType = "PERCENT" | "FIXED";
export type DialogMode = "create" | "edit" | "view";
export type CustomerEligibility = "ALL" | "GUEST" | "REGISTERED_MEMBER";

export type Promotion = {
  id: number;
  hotelId: number;
  scope: PromoScope;
  minTotal?: number;
  code?: string;
  type: PromoType;
  value: number;
  startAt: string;
  endAt: string;
  quotaTotal?: number;
  quotaUsed?: number;
  description?: string;
  name?: string;
  autoApply: boolean;
  priority: number;
  maxDiscountAmount?: number;
  eligibleFor: CustomerEligibility;
  isActive: boolean;
  roomTypes?: number[];
  isStackable: boolean;
};

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "CHECKED_OUT";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
export type PaymentStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

export interface Booking {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  baseAmount: string;
  discountAmount: string;
  createdAt: string;
  room: {
    name: string;
    roomType: {
      name: string;
      basePrice?: string;
    };
  };
  promotion: {
    name: string;
  };
  paymentStatus: PaymentStatus;
}

export interface QuoteResponse {
  nights: number;
  unitPrice: number;
  totalBefore: number;
  discount: number;
  promoApplied: null | {
    id: number;
    code: string | null;
    name: string;
    scope: PromoScope;
    type: "PERCENT" | "FIXED";
    value: number;
    priority: number;
    autoApply: boolean;
  };
}

export type DashboardSummary = {
  todayBookings: number;
  availableRooms: number;
  totalRooms: number;
  occupancyPct: number;
  weekRevenue: number;
  newCustomers: number;

  bookingsDeltaPct: number;
  occupancyDeltaPct: number;
  availableRoomsDelta: number;
  weekRevenueDeltaPct: number;
  newCustomersDelta: number;
  totalCleanRooms: number;
};

export type MonthlyKpis = {
  totalRevenue: number;
  totalRevenueDeltaPct?: number;
  occupancyPct: number;
  occupancyDeltaPct?: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  label: string;
  revenue: number;
};

export type MonthlyRevenue = {
  months: MonthlyRevenuePoint[];
};

export type MonthlyBookingStats = {
  month: string;
  total: number;
  success: number;
  cancelled: number;
  cancelRate: number;
};

export type TopCustomer = {
  rank: number;
  name: string;
  bookings: number;
  totalPaid: number;
};

export type TopCustomers = {
  month: string;
  items: TopCustomer[];
};
export interface Review {
  id: number;
  bookingId: number;
  userId?: number | null;
  customerId?: number | null;
  roomId: number;
  overall: number;
  amenities?: number | null;
  cleanliness?: number | null;
  comfort?: number | null;
  locationScore?: number | null;
  valueForMoney?: number | null;
  hygiene?: number | null;
  comment?: string | null;
  status: "PENDING" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  user?: { id: number; fullName: string; email?: string };
  customer?: { id: number; fullName: string; phone: string; email: string };
  room?: {
    id: number;
    name: string;
    roomType: {
      id: number;
      name: string;
      basePrice: number;
      capacity: number;
      images?: {
        id: number;
        url: string;
        isPrimary: boolean;
        sortOrder: number;
      }[];
    };
  };
  booking: Pick<Booking, "checkIn" | "checkOut">;

  // BE map thêm displayName
  displayName: string;
}
export type ReviewStats = {
  average: number;
  total: number;
  hidden: number;
};

export type ReviewStatus = "PUBLISHED" | "HIDDEN";

export interface RoomTypeReviewItem {
  id: number;
  overall: number;
  amenities?: number | null;
  cleanliness?: number | null;
  comfort?: number | null;
  locationScore?: number | null;
  valueForMoney?: number | null;
  hygiene?: number | null;
  comment?: string | null;
  createdAt: string;
  room: {
    id: number;
    name: string;
  };
  displayName: string;
}

export interface RoomTypeReviewStats {
  total: number;
  average: {
    overall: number | null;
    amenities: number | null;
    cleanliness: number | null;
    comfort: number | null;
    locationScore: number | null;
    valueForMoney: number | null;
    hygiene: number | null;
  };
}

export interface SePayCheckoutFields {
  payment_method: "BANK_TRANSFER";
  order_invoice_number: number | string;
  order_amount: number;
  currency: "VND";
  order_description: string;
  success_url: string;
  error_url: string;
  cancel_url: string;
  merchant: string;
  operation: "PURCHASE";
  signature: string;
}

export interface Employee {
  id: number;
  phone: string;
  email: string;
  fullName: string;
  type: "STAFF" | "CUSTOMER";
  isActive: boolean;
  staff: {
    position: UserRole;
    isAdmin: boolean;
  };
}

export interface Shift {
  id: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
}
export interface StaffShiftAssignment {
  id: number;
  staffId: number;
  workDate: string;
  position: Omit<UserRole, "CUSTOMER">;
  shift: Shift;
}
