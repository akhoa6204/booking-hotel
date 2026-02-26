export function collectNewImages(
  req,
  { ownerId, idField, folderName, bodyField = "images" },
) {
  const base = `${req.protocol}://${req.get("host")}`;
  const out = [];

  // 1) body[bodyField] (array | JSON string | CSV string)
  let bodyImages = [];
  const raw = req.body?.[bodyField];

  if (Array.isArray(raw)) {
    bodyImages = raw;
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      bodyImages = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      bodyImages = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  const urls = Array.from(
    new Set(
      bodyImages
        .filter((u) => typeof u === "string")
        .map((u) => u.trim())
        .filter((u) => u && !u.startsWith("blob:")),
    ),
  );

  urls.forEach((url, i) => {
    out.push({
      [idField]: ownerId,
      url,
      sortOrder: i,
    });
  });

  // 2) files
  const files = Array.isArray(req.files) ? req.files : [];
  files.forEach((f, i) => {
    out.push({
      [idField]: ownerId,
      url: `${base}/uploads/${folderName}/${f.filename}`,
      alt: f.originalname,
      sortOrder: urls.length + i,
    });
  });

  // 3) normalize sort + primary
  out
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((it, idx) => {
      it.sortOrder = idx;
      it.isPrimary = idx === 0;
    });

  return out;
}
