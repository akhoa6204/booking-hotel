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
export type UserRole = "MANAGER" | "CUSTOMER";
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
  sortOrder: number;
};
export type RoomType = {
  id: number;
  hotelId: number;
  name: string;
  basePrice: number;
  capacity: number;
  description?: string | null;
  amenities: Amenity[];
  rooms?: { id: number; name: string; status: string }[];
  images?: Image[];
  createdAt?: string;
  updatedAt?: string;
};

export type RoomTypeGuest = Omit<RoomType, "rooms"> & { image: string };

export type RoomStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE";

export type Room = {
  id: number;
  hotelId: number;
  roomTypeId: number;
  name: string;
  active: boolean;
  description?: string | null;
  status: RoomStatus;
  roomType: RoomType;
  image: string;
};

export type PromoScope = "GLOBAL" | "ROOM_TYPE" | "MIN_TOTAL";
export type PromoType = "PERCENT" | "FIXED";
export type DialogMode = "create" | "edit";

export type Promotion = {
  id: number;
  hotelId: number;
  scope: PromoScope;
  roomTypeId?: number | null;
  minTotal?: number | null;
  code?: string | null;
  discountType: PromoType;
  value: number;
  conditions?: any | null;
  startDate: string;
  endDate: string;
  active: boolean;
  totalCodes?: number | null;
  totalUsed?: number;
  roomType?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
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
  userId?: number | null;
  customerId?: number | null;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;

  room: {
    id: number;
    name: string;
    roomType: {
      id: number;
      name: string;
      basePrice: number;
      capacity: number;
      images?: Image[];
    };
  };

  roomId: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;

  totalPrice: number;
  discountAmount: number;
  finalPrice: number;

  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  source: "ONLINE" | "STAFF";
  createdByUserId?: number | null;

  promotion?: {
    id: number;
    code?: string | null;
    description?: string | null;
    scope: PromoScope;
    discountType: PromoType;
    value: number;
  } | null;

  payments?: Array<{
    id: number;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt?: string | null;
    provider?: string | null;
    note?: string | null;
  }>;
  canReview: boolean;
}

export interface QuoteResponse {
  nights: number;
  unitPrice: number;
  totalBefore: number;
  discount: number;
  promoApplied: null | {
    id: number;
    code: string | null;
    scope: string;
    type: "PERCENT" | "FIXED";
    value: number;
  };
  totalAfter: number;
  currency: string;
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

export type RoomTypeReviewItem = {
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
};

export type RoomTypeReviewStats = {
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
};
