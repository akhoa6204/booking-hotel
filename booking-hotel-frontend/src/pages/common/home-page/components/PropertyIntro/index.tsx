import { ImageHotel } from "@assets/images";
import { Box, Grid, Typography } from "@mui/material";

const PropertyIntro = () => {
  return (
    <Box sx={{ my: 12.5, borderRadius: 2, bgcolor: "#F4FBF8" }}>
      <Grid container>
        <Grid size={6}>
          <Box component={"img"} src={ImageHotel} />
        </Grid>
        <Grid size={6} sx={{ px: 9, pt: 9 }}>
          <Typography variant="body2" fontSize={40} fontWeight={600}>
            Về Skyline
          </Typography>
          <Typography variant="body2" sx={{ my: 2.5 }}>
            Tọa lạc ngay giữa trung tâm Đà Nẵng, Skyline là điểm dừng chân lý
            tưởng cho những ai đang tìm kiếm sự kết hợp hoàn hảo giữa tiện nghi
            hiện đại và không gian nghỉ dưỡng đẳng cấp.
          </Typography>
          <Typography variant="body2">
            Khách sạn sở hữu hệ thống phòng nghỉ sang trọng với thiết kế tinh
            tế, nội thất cao cấp và tầm nhìn toàn cảnh thành phố. Mỗi chi tiết
            đều được chăm chút tỉ mỉ, mang đến cho quý khách cảm giác thoải mái
            và riêng tư tuyệt đối.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PropertyIntro;
