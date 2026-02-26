export const DAY = 24 * 60 * 60 * 1000;
export const toDate = (date) => new Date(date);
export const computeNight = (startDate, endDate) =>
  Math.max(1, Math.ceil((endDate - startDate) / DAY));
