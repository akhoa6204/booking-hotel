export const parsePageLimit = (
  req,
  { maxLimit = 100, defaultLimit = 20 } = {}
) => {
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
  const limitRaw =
    parseInt(req.query.limit ?? `${defaultLimit}`, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, limitRaw), maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildOffsetMeta = ({ page, limit, total }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
};
