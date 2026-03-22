import { PaymentMethod, PaymentType } from "@constant/types";
import useSnackbar from "@hooks/useSnackbar";
import BookingService from "@services/BookingService";
import InvoiceService from "@services/InvoiceService";
import PaymentService from "@services/PaymentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const usePayment = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location?.search);
  const result = params.get("result");
  const paymentIdFromParams = params.get("paymentId");
  const bookingIdFromParams = params.get("bookingId");
  const invoiceIdFromParams = params.get("invoiceId");

  const bookingId = bookingIdFromParams
    ? Number(bookingIdFromParams)
    : Number(location?.state?.bookingId || 0);

  const invoiceId = invoiceIdFromParams
    ? Number(invoiceIdFromParams)
    : Number(location?.state?.invoiceId || 0);

  const [showNotice, setShowNotice] = useState({
    open: false,
    type: "success",
  });

  useEffect(() => {
    if (result === "success" && paymentIdFromParams) {
      mMarkPaymentAsPaid.mutateAsync(Number(paymentIdFromParams));
      setShowNotice({
        open: true,
        type: "success",
      });
    } else if (
      (result === "cancel" || result === "fail") &&
      paymentIdFromParams
    ) {
      mMarkPaymentAsCancelled.mutateAsync(Number(paymentIdFromParams));
      setShowNotice({
        open: true,
        type: "error",
      });
    }

    if (result) {
      window.history.replaceState({}, "", location?.pathname);
    }
  }, [location?.pathname, paymentIdFromParams, result]);

  const { alert, showSuccess, showError, closeSnackbar } = useSnackbar();
  useEffect(() => {
    if (!invoiceId || !bookingId) {
      navigate("/search", { replace: true });
    }
  }, [bookingId, invoiceId, navigate]);

  const submitToSePay = (url: string, fields: Record<string, any>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const { data: invoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => await InvoiceService.getByIdCustomer(invoiceId),
    enabled: !!invoiceId,
  });

  const { data: booking, isLoading: loadingBooking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => await BookingService.getByIdCustomer(bookingId),
    enabled: !!bookingId,
  });

  const mCreatePaymentOnline = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: number }) => {
      return PaymentService.createPaymentOnline(paymentId);
    },

    onSuccess: (res: any) => {
      if (res.checkoutURL && res.fields) {
        submitToSePay(res.checkoutURL, res.fields);
        return;
      }
    },

    onError: () => {
      showError("Tạo thanh toán online thất bại");
    },
  });

  const mCreatePayment = useMutation({
    mutationFn: async ({
      invoiceId,
      method,
      amount,
      type,
    }: {
      invoiceId: number;
      method: PaymentMethod;
      amount: number;
      type?: PaymentType;
    }): Promise<{ paymentId: number }> => {
      return await PaymentService.customerCreate(
        invoiceId,
        method,
        amount,
        type,
      );
    },
    onSuccess: async (data) => {
      await mCreatePaymentOnline.mutateAsync({
        paymentId: Number(data.paymentId),
      });
    },

    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Tạo thanh toán thất bại";
      showError(msg);
    },
  });

  const mMarkPaymentAsPaid = useMutation({
    mutationFn: async (paymentId: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await PaymentService.customerUpdateStatus(paymentId, {
        status: "PAID",
      });
    },
  });

  const mMarkPaymentAsCancelled = useMutation({
    mutationFn: async (paymentId: number) =>
      await PaymentService.customerUpdateStatus(paymentId, {
        status: "FAILED",
      }),
  });

  const onPayment = async () => {
    await mCreatePayment.mutateAsync({
      invoiceId,
      method: "TRANSFER",
      amount: 150000,
      type: "DEPOSIT",
    });
  };

  const backToHome = () => navigate("/", { replace: true });
  return {
    invoice,
    loadingInvoice,

    booking,
    loadingBooking,

    onPayment,
    loadingPayment: mCreatePayment.isPending,

    alert,
    closeSnackbar,

    showNotice,
    backToHome,
  };
};
export default usePayment;
