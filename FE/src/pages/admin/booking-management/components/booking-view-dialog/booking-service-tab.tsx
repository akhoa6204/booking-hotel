import { Invoice, Service, ServiceType } from "@constant/types";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { ServiceFilter } from "../../useBookingManagement";
import Pager from "@components/pager";
import { Meta } from "@constant/response/paginated";
import { fmtVND } from "@utils/format";

type Props = {
  services: Service[];
  invoice: Invoice;
  filterService: ServiceFilter;
  metaServices?: Meta;
  loadingInvoiceDetail: boolean;
  onChangePageService: (page: number) => void;
  onChangeTabService: (tab: ServiceType) => void;
  updateService: (
    id: number,
    services: { serviceId: number; quantity: number }[],
  ) => void;
  removeService: (id: number, removeItemIds: number[]) => void;
  canEdit: boolean;
};

export default function BookingServiceTab({
  services,
  invoice,
  filterService,
  metaServices,
  loadingInvoiceDetail,
  onChangePageService,
  onChangeTabService,
  updateService,
  removeService,
  canEdit = false,
}: Props) {
  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* HOTEL SERVICES */}
      <Grid
        size={6}
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
        }}
      >
        <Typography fontWeight={600} mb={1}>
          Dịch vụ khách sạn
        </Typography>

        <Tabs
          value={filterService.type}
          onChange={(_, v) => onChangeTabService(v)}
          sx={{ mb: 1 }}
        >
          <Tab value="SERVICE" label="Dịch vụ" />
          <Tab value="EXTRA_FEE" label="Phí phát sinh" />
        </Tabs>

        <List sx={{ height: 320 }}>
          {services
            .filter((s) => s.type === filterService.type)
            .map((s) => {
              const existed = invoice?.items?.some((i) => i.serviceId === s.id);

              return (
                <ListItem
                  key={s.id}
                  divider
                  sx={{
                    cursor: canEdit ? "pointer" : "not-allowed",
                    transition: "all .15s ease",
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                    },
                  }}
                  onClick={() => {
                    if (!canEdit) return;
                    const existedItem = invoice?.items?.find(
                      (i) => i.serviceId === s.id,
                    );

                    if (!invoice) return;

                    if (existedItem) {
                      updateService(invoice.invoiceId, [
                        {
                          serviceId: s.id,
                          quantity: existedItem.quantity + 1,
                        },
                      ]);
                    } else {
                      updateService(invoice.invoiceId, [
                        { serviceId: s.id, quantity: 1 },
                      ]);
                    }
                  }}
                  secondaryAction={
                    <Typography fontWeight={600}>
                      {fmtVND(s.price)} đ
                    </Typography>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>{s.name}</Typography>
                        {existed && (
                          <Typography
                            fontSize={11}
                            px={1}
                            py={0.25}
                            borderRadius={1}
                            bgcolor="#2E90FA"
                            color="#fff"
                          >
                            Đã thêm
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={s.description}
                  />
                </ListItem>
              );
            })}
        </List>

        {metaServices?.totalPages > 1 && (
          <Box display="flex" justifyContent="center">
            <Pager
              totalPages={metaServices.totalPages}
              page={metaServices.page}
              onChange={onChangePageService}
            />
          </Box>
        )}
      </Grid>

      {/* BOOKING SERVICES */}
      <Grid size={6}>
        <Typography fontWeight={600} mb={1}>
          Dịch vụ của booking
        </Typography>

        {loadingInvoiceDetail ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : invoice?.items?.length > 1 ? (
          <List>
            {invoice.items
              .filter((item) => item.service)
              .map((item) => (
                <ListItem
                  key={item.id}
                  divider
                  secondaryAction={
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        disabled={!canEdit}
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateService(invoice.invoiceId, [
                              {
                                serviceId: item.serviceId,
                                quantity: item.quantity - 1,
                              },
                            ]);
                          } else {
                            removeService(invoice.invoiceId, [item.id]);
                          }
                        }}
                      >
                        <Remove />
                      </IconButton>

                      <Typography width={24} textAlign="center">
                        {item.quantity}
                      </Typography>

                      <IconButton
                        size="small"
                        disabled={!canEdit}
                        onClick={() =>
                          updateService(invoice.invoiceId, [
                            {
                              serviceId: item.serviceId,
                              quantity: item.quantity + 1,
                            },
                          ])
                        }
                      >
                        <Add />
                      </IconButton>

                      <Button
                        size="small"
                        color="error"
                        disabled={!canEdit}
                        onClick={() =>
                          removeService(invoice.invoiceId, [item.id])
                        }
                      >
                        Xóa
                      </Button>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={item.service.name}
                    secondary={`Số lượng: ${item.quantity}`}
                  />
                </ListItem>
              ))}
          </List>
        ) : (
          <Typography color="text.secondary">Chưa có dịch vụ nào</Typography>
        )}
      </Grid>
    </Grid>
  );
}
