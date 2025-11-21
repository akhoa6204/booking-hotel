import { Stack, IconButton, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
};

const buildRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

function usePageItems(
  page: number,
  total: number,
  sibling = 1,
  boundary = 1
): (number | "...")[] {
  const start = Math.max(1, page - sibling);
  const end = Math.min(total, page + sibling);

  const left = buildRange(1, Math.min(boundary, total));
  const middle = buildRange(start, end);
  const right = buildRange(Math.max(total - boundary + 1, 1), total);

  const showLeftDots = start > boundary + 1;
  const showRightDots = end < total - boundary;

  const items: (number | "...")[] = [];
  items.push(...left);
  if (showLeftDots) items.push("...");
  items.push(...middle.filter((n) => !left.includes(n) && !right.includes(n)));
  if (showRightDots) items.push("...");
  items.push(...right.filter((n) => !left.includes(n)));

  return Array.from(new Set(items)).filter((n) =>
    typeof n === "number" ? n >= 1 && n <= total : true
  );
}

export default function Pager({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  boundaryCount = 1,
}: Props) {
  const items = usePageItems(page, totalPages, siblingCount, boundaryCount);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton
        size="small"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowBack />
      </IconButton>

      {items.map((it, idx) =>
        it === "..." ? (
          <Button
            key={`dots-${idx}`}
            size="small"
            disabled
            sx={{ minWidth: 0 }}
          >
            …
          </Button>
        ) : (
          <Button
            key={it}
            size="small"
            onClick={() => onChange(it as number)}
            variant="text"
            sx={{
              minWidth: 36,
              borderRadius: 1.5,
              bgcolor: it === page ? "grey.100" : "transparent",
              color: it === page ? "text.primary" : "text.secondary",
              fontWeight: it === page ? 600 : 400,
              "&:hover": {
                bgcolor: it === page ? "grey.100" : "grey.50",
              },
            }}
          >
            {it}
          </Button>
        )
      )}

      <IconButton
        size="small"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ArrowForward />
      </IconButton>
    </Stack>
  );
}
