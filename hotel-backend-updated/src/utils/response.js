export const success = (
  res,
  data = null,
  message = "OK",
  code = 200,
  pagination = null
) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(code).json(body);
};

export const bad = (
  res,
  message = "Bad Request",
  code = 400,
  details = null
) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(code).json(body);
};
