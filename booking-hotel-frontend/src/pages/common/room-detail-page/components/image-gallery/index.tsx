import { Image } from "@constant/types";
import { Box, Grid } from "@mui/material";

interface Props {
  images: Image[];
}
const ImageGallery: React.FC<Props> = ({ images }) => {
  if (!images || images.length === 0) return null;

  const [main, ...rest] = images;
  const others = rest.slice(0, 4);
  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Box
          component={"img"}
          src={main.url}
          sx={{
            width: "100%",
            objectFit: "cover",
            borderRadius: 2,
            display: "block",
          }}
        />
      </Grid>
      <Grid size={6} container spacing={1}>
        {others.map((image) => (
          <Grid size={6} key={image.id}>
            <Box
              component={"img"}
              src={image.url}
              sx={{
                width: "100%",
                objectFit: "cover",
                borderRadius: 2,
                display: "block",
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
export default ImageGallery;
