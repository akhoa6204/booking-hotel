export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

export type PaginatedResponse<T> = { items: T[]; meta: Meta };
