import { Box, Grid, Skeleton } from "@mui/material";

const ImageGallerySkeleton = () => {
  return (
    <Grid container spacing={2}>
      {/* Ảnh lớn */}
      <Grid size={6}>
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: 340,
            borderRadius: 2,
          }}
        />
      </Grid>

      {/* 4 ảnh nhỏ */}
      <Grid size={6} container spacing={1}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid size={6} key={i}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                height: 168,
                borderRadius: 2,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default ImageGallerySkeleton;
