import { ImageHotel } from "@assets/images";
import { Box, Grid, Typography } from "@mui/material";

const PropertyIntro = () => {
  return (
    <Box sx={{ my: 12.5, borderRadius: 2, bgcolor: "#2E90FA0d" }}>
      <Grid container>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box component={"img"} src={ImageHotel} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ p: { xs: 4.5, sm: 9 } }}>
          <Typography variant="body2" fontSize={40} fontWeight={600}>
            Về Diamond Sea
          </Typography>
          <Typography variant="body2" sx={{ my: 2.5 }}>
            Tọa lạc ngay giữa trung tâm Đà Nẵng, Diamond Sea là điểm dừng
            chân lý tưởng cho những ai đang tìm kiếm sự kết hợp hoàn hảo giữa
            tiện nghi hiện đại và không gian nghỉ dưỡng đẳng cấp.
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
