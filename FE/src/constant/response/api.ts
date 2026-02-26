export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFail = {
  success: false;
  message: string;
};
