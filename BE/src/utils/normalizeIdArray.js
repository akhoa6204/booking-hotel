export function normalizeIdArray(raw) {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    const flattened = raw.flatMap((v) => {
      if (typeof v === "string") {
        const s = v.trim();
        if (!s) return [];
        if (s.startsWith("[")) {
          try {
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [s];
          }
        }
        return [s];
      }
      return [v];
    });

    return flattened.map((v) => Number(v)).filter(Number.isFinite);
  }

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];

    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v)).filter(Number.isFinite);
      }
      return [Number(parsed)].filter(Number.isFinite);
    } catch {
      return [];
    }
  }

  return [Number(raw)].filter(Number.isFinite);
}
