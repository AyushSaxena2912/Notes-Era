import {
  getCashfreeBaseUrl,
  getCashfreeEnv,
  getCashfreeHeaders,
} from "../config/cashfree.config";

type CashfreeCustomer = {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone: string;
};

type CreateCashfreeOrderInput = {
  orderId: string;
  /** Amount in INR (rupees), not paise */
  amountRupees: number;
  customer: CashfreeCustomer;
  orderNote?: string;
  returnUrl?: string;
};

const cashfreeFetch = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${getCashfreeBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getCashfreeHeaders(),
      ...(init?.headers || {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const message =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      `Cashfree request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

/** Cashfree production rejects non-https return_url. */
const getCashfreeReturnBase = () => {
  const configured = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
  if (getCashfreeEnv() === "production") {
    if (configured.startsWith("https://")) return configured;
    return "https://notes-era.vercel.app";
  }
  return configured || "http://localhost:3001";
};

const createCashfreeOrder = async ({
  orderId,
  amountRupees,
  customer,
  orderNote,
  returnUrl,
}: CreateCashfreeOrderInput) => {
  const frontendUrl = getCashfreeReturnBase();
  const resolvedReturnUrl =
    returnUrl ||
    `${frontendUrl}/orders?order_id={order_id}&gateway=cashfree`;

  const data = await cashfreeFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number(amountRupees),
      order_currency: "INR",
      order_note: orderNote || "Notes-Era module purchase",
      customer_details: {
        customer_id: customer.customerId.slice(0, 50),
        customer_name: customer.customerName || "Student",
        customer_email: customer.customerEmail || undefined,
        customer_phone: customer.customerPhone,
      },
      order_meta: {
        return_url: resolvedReturnUrl,
      },
    }),
  });

  const paymentSessionId = String(data.payment_session_id || "");
  if (!paymentSessionId) {
    throw new Error("Cashfree did not return payment_session_id.");
  }

  return {
    orderId: String(data.order_id || orderId),
    paymentSessionId,
    amount: Number(data.order_amount ?? amountRupees),
    currency: String(data.order_currency || "INR"),
    mode: getCashfreeEnv(),
  };
};

const getCashfreeOrder = async (orderId: string) => {
  return cashfreeFetch(`/orders/${encodeURIComponent(orderId)}`);
};

const getCashfreePayments = async (orderId: string) => {
  const data = await cashfreeFetch(
    `/orders/${encodeURIComponent(orderId)}/payments`,
  );
  return Array.isArray(data) ? data : [];
};

/**
 * Confirms the order is PAID on Cashfree's servers (do not trust the client alone).
 */
const verifyCashfreePayment = async (orderId: string) => {
  const order = await getCashfreeOrder(orderId);
  const status = String(order.order_status || "").toUpperCase();
  if (status !== "PAID") {
    return null;
  }

  const payments = await getCashfreePayments(orderId);
  const success = payments.find(
    (payment) =>
      String((payment as { payment_status?: string }).payment_status || "")
        .toUpperCase() === "SUCCESS",
  ) as { cf_payment_id?: string | number; payment_status?: string } | undefined;

  return {
    orderId: String(order.order_id || orderId),
    paymentId: String(success?.cf_payment_id || `cf_${orderId}`),
    orderStatus: status,
  };
};

export {
  createCashfreeOrder,
  getCashfreeOrder,
  getCashfreePayments,
  verifyCashfreePayment,
};
