import axios from "axios";
import { authFetch, getAccessToken } from "./studentAuth";

const backendUrl =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";
// Production Render:
// const backendUrl = "https://notesera-back-end.onrender.com/api";

let reposCache = null;
let reposPromise = null;
let wakePromise = null;

/** Hit backend early so cold starts finish before modules need data. */
const wakeBackend = () => {
  if (wakePromise) return wakePromise;
  wakePromise = axios
    .get(`${backendUrl}/modules`, { timeout: 45000 })
    .then(({ data }) => {
      if (!data?.isErr && Array.isArray(data?.body) && data.body.length) {
        reposCache = data;
      }
      return data;
    })
    .catch(() => null);
  return wakePromise;
};

const fetchAllRepos = async ({ force = false } = {}) => {
  if (!force && reposCache) return reposCache;
  if (!force && reposPromise) return reposPromise;

  const request = () =>
    axios.get(`${backendUrl}/modules`, { timeout: 45000 }).then(({ data }) => {
      if (!data?.isErr && Array.isArray(data?.body) && data.body.length) {
        reposCache = data;
      }
      return data;
    });

  reposPromise = (wakePromise || Promise.resolve())
    .catch(() => null)
    .then(async () => {
      if (!force && reposCache) return reposCache;
      try {
        return await request();
      } catch (err) {
        try {
          return await request();
        } catch (retryErr) {
          console.error(`Error fetching all repos: ${retryErr}.`);
          return { isErr: true };
        }
      }
    })
    .finally(() => {
      reposPromise = null;
    });

  return reposPromise;
};

const fetchRepo = async (repoId) => {
  try {
    const { data } = await axios.get(`${backendUrl}/modules/${repoId}`, {
      timeout: 45000,
    });
    return data;
  } catch (err) {
    console.error(`Error fetching repo(${repoId}): ${err}.`);
    return { isErr: true };
  }
};

const createOrder = async (slug, type) => {
  try {
    if (!getAccessToken()) {
      return { isErr: true, message: "Authentication required.", status: 401 };
    }
    const { response, data } = await authFetch("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ productId: slug, type }),
    });
    if (!response.ok) {
      return { isErr: true, ...data, status: response.status };
    }
    return data;
  } catch (err) {
    console.error(`Error creating order: ${err}.`);
    return { isErr: true };
  }
};

const createCartOrder = async (productIds, couponCode) => {
  try {
    if (!getAccessToken()) {
      return { isErr: true, message: "Authentication required.", status: 401 };
    }
    const { response, data } = await authFetch("/payment/create-cart-order", {
      method: "POST",
      body: JSON.stringify({
        productIds,
        ...(couponCode ? { couponCode } : {}),
      }),
    });
    if (!response.ok) {
      return { isErr: true, ...data, status: response.status };
    }
    return data;
  } catch (err) {
    console.error(`Error creating cart order: ${err}.`);
    return { isErr: true };
  }
};

const verifyPayment = async (paymentDetails, successCallback) => {
  const { response, data } = await authFetch("/payment/verify", {
    method: "POST",
    body: JSON.stringify(paymentDetails),
  });
  if (response.ok && data?.status === "success") successCallback();
  return { ok: response.ok, data };
};

const fetchModuleAccess = async (slug) => {
  const { response, data } = await authFetch(`/access/modules/${slug}`);
  return { ok: response.ok, data };
};

export {
  backendUrl,
  wakeBackend,
  fetchAllRepos,
  fetchRepo,
  createOrder,
  createCartOrder,
  verifyPayment,
  fetchModuleAccess,
};
