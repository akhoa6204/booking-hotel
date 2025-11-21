import { Container } from "@mui/material";
import HeroSection from "./components/hero-section";
import useHome from "./useHome";
import RoomList from "./components/room-list";
import ServicesSection from "./components/services-section";
import HeroSectionMobile from "./components/hero-section-mobile";
import PropertyIntro from "./components/PropertyIntro";
import GlobalSnackbar from "@components/GlobalSnackbar";

const HomePage = () => {
  const {
    rooms,
    loading,
    form,
    onChange,
    onSubmit,
    errors,
    isMobile,
    onClickSeeAll,
    alert,
    closeSnackbar,
    onClickRoomCard,
  } = useHome();
  return (
    <>
      {!isMobile ? (
        <Container>
          <HeroSection form={form} onChange={onChange} onSubmit={onSubmit} />
        </Container>
      ) : (
        <HeroSectionMobile
          form={form}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )}

      <Container>
        <RoomList
          rooms={rooms}
          loading={loading}
          onClickSeeAll={onClickSeeAll}
          onClickRoomCard={onClickRoomCard}
        />
        <ServicesSection />
        <PropertyIntro />
      </Container>
      <GlobalSnackbar alert={alert} closeSnackbar={closeSnackbar} />
    </>
  );
};

export default HomePage;
