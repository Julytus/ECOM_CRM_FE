import * as React from "react";
import { io, type Socket } from "socket.io-client";
import env from "@/lib/env";
import { useAuthStore } from "@/lib/stores/auth";

export interface PaymentDonePayload {
  invoiceId: number;
}

function getSocketUrl() {
  return env.VITE_SOCKET_URL;
}

export function connectPaymentSocket(userId: number): Socket {
  return io(getSocketUrl(), {
    autoConnect: false,
    query: { userId: String(userId) }
  });
}

export function usePaymentDone(invoiceId: number | undefined, onPaymentDone: () => void) {
  const userId = useAuthStore((state) => state.userId);

  React.useEffect(() => {
    if (invoiceId === undefined || userId == null) return;

    const socket = connectPaymentSocket(userId);
    const handlePaymentDone = (payload: PaymentDonePayload) => {
      if (Number(payload?.invoiceId) === invoiceId) onPaymentDone();
    };

    socket.on("payment_done", handlePaymentDone);
    socket.connect();

    return () => {
      socket.off("payment_done", handlePaymentDone);
      socket.disconnect();
    };
  }, [invoiceId, onPaymentDone, userId]);
}

