const CART_KEY = "notesera-cart";
const CART_EVENT = "notesera-cart-updated";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart() {
  return readCart();
}

export function getCartCount() {
  return readCart().length;
}

/** Notes/booklets: one copy only — already in cart stays as-is */
export function addToCart(module) {
  const cart = readCart();
  const exists = cart.some((item) => item.id === module.id);
  if (!exists) {
    cart.push({ ...module });
    writeCart(cart);
  }
  return cart;
}

export function removeFromCart(id) {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart() {
  writeCart([]);
}

export function subscribeCart(callback) {
  const handler = () => callback(getCartCount());
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function subscribeCartItems(callback) {
  const handler = () => callback(getCart());
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
