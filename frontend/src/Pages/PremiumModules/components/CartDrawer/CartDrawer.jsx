import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import {
  clearCart,
  getCart,
  removeFromCart,
  subscribeCartItems,
} from "../../../../utils/cart";
import { findCoupon, getCouponDiscount } from "../../../../utils/coupons";
import { openCashfreeCheckout } from "../../../../utils/cashfree";
import { getRazorPay } from "../../../../utils/razorpay";
import { createCartOrder, verifyPayment } from "../../../../utils/modules";
import {
  getStudentUser,
  isStudentLoggedIn,
} from "../../../../utils/studentAuth";
import { extractCollege } from "../../utils/moduleFilters";
import styles from "./CartDrawer.module.css";

const PLATFORM_FEE = 2;

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState(() => getCart());
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setItems(getCart());
    return subscribeCartItems(setItems);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [items],
  );

  const discount = useMemo(
    () => getCouponDiscount(appliedCoupon, subtotal),
    [appliedCoupon, subtotal],
  );

  const platformFee = items.length > 0 ? PLATFORM_FEE : 0;
  const total = Math.max(0, subtotal - discount + platformFee);

  const handleApplyCoupon = (event) => {
    event.preventDefault();
    const coupon = findCoupon(couponInput);
    if (!coupon) {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code");
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError("");
    setCouponInput(coupon.code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  };

  const handleCheckout = async () => {
    if (!items.length || isCheckingOut) return;

    if (!isStudentLoggedIn()) {
      onClose();
      const next = `${location.pathname}${location.search}`;
      navigate(`/login?next=${encodeURIComponent(next || "/")}`);
      return;
    }

    const student = getStudentUser();
    if (!student?.email) {
      setCheckoutError("Please log in again to continue checkout.");
      return;
    }

    const productIds = items.map((item) => item.slug).filter(Boolean);
    if (!productIds.length) {
      setCheckoutError("Cart items are missing module ids. Re-add them.");
      return;
    }

    setCheckoutError("");
    setIsCheckingOut(true);

    const buyer = {
      name: student.name || "",
      contactNumber: String(student.mobileNumber || "").replace(/\D/g, ""),
      email: student.email,
    };

    const order = await createCartOrder(
      productIds,
      appliedCoupon?.code || undefined,
    );

    if (order?.isErr || !order?.token) {
      setIsCheckingOut(false);
      if (order?.status === 401) {
        onClose();
        const next = `${location.pathname}${location.search}`;
        navigate(`/login?next=${encodeURIComponent(next || "/")}`);
        return;
      }
      setCheckoutError(order?.message || "Could not create payment order.");
      return;
    }

    try {
      if (order.gateway === "cashfree") {
        const result = await openCashfreeCheckout({
          paymentSessionId: order.payment_session_id,
          mode: order.mode || "sandbox",
        });

        if (result?.error) {
          setIsCheckingOut(false);
          setCheckoutError(
            result.error.message || "Payment was cancelled or failed.",
          );
          return;
        }

        const { ok, data } = await verifyPayment(
          {
            ...buyer,
            token: order.token,
            orderId: order.order_id,
            gateway: "cashfree",
          },
          () => {},
        );

        setIsCheckingOut(false);
        if (!ok) {
          setCheckoutError(
            data?.message ||
              "Payment could not be verified. If money was deducted, contact support.",
          );
          return;
        }

        clearCart();
        onClose();
        navigate("/orders");
        return;
      }

      const rzp = getRazorPay({
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        key: order.key,
        name: order.name,
        description: order.description,
        prefill: {
          name: buyer.name,
          email: buyer.email,
          contact: buyer.contactNumber
            ? `+91${buyer.contactNumber.slice(-10)}`
            : undefined,
        },
        theme: { color: "#8b5cf6" },
        handler: async ({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }) => {
          const { ok, data } = await verifyPayment(
            {
              ...buyer,
              token: order.token,
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              signature: razorpay_signature,
              gateway: "razorpay",
            },
            () => {},
          );
          setIsCheckingOut(false);
          if (!ok) {
            setCheckoutError(
              data?.message || "Payment could not be verified.",
            );
            return;
          }
          clearCart();
          onClose();
          navigate("/orders");
        },
      });
      rzp.on("payment.failed", () => {
        setIsCheckingOut(false);
        setCheckoutError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsCheckingOut(false);
      setCheckoutError(err?.message || "Could not open payment checkout.");
    }
  };

  return (
    <div
      className={`${styles.root} ${open ? styles.open : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close cart"
        onClick={onClose}
      />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <header className={styles.header}>
          <div>
            <h2>Your cart</h2>
            <p>
              {items.length} module{items.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close cart"
            onClick={onClose}
          >
            <FiX />
          </button>
        </header>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <FiShoppingBag />
              <h3>Cart is empty</h3>
              <p>Add modules from the shop to see them here.</p>
              <button type="button" className={styles.shopBtn} onClick={onClose}>
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const college =
                  item.college || extractCollege(item.about || "");
                return (
                  <li key={item.id} className={styles.item}>
                    <a href={item.link || "#modules"} className={styles.thumb}>
                      <img
                        src={
                          item.imgSrc ||
                          "/Assets2/Premium-Modules/module-cover.png"
                        }
                        alt=""
                      />
                    </a>
                    <div className={styles.meta}>
                      <a href={item.link || "#modules"} className={styles.name}>
                        {item.name}
                      </a>
                      {college ? (
                        <p className={styles.college}>{college}</p>
                      ) : null}
                      <div className={styles.row}>
                        <span className={styles.price}>₹{item.price}</span>
                        <button
                          type="button"
                          className={styles.remove}
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FiTrash2 />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className={styles.footer}>
            <form className={styles.coupon} onSubmit={handleApplyCoupon}>
              <label className={styles.couponLabel} htmlFor="cart-coupon">
                Coupon code
              </label>
              <div className={styles.couponRow}>
                <input
                  id="cart-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(event) => {
                    setCouponInput(event.target.value);
                    if (couponError) setCouponError("");
                  }}
                  placeholder="Enter code"
                  disabled={Boolean(appliedCoupon)}
                  autoComplete="off"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    className={styles.couponRemove}
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                ) : (
                  <button type="submit" className={styles.couponApply}>
                    Apply
                  </button>
                )}
              </div>
              {couponError ? (
                <p className={styles.couponError}>{couponError}</p>
              ) : null}
              {appliedCoupon ? (
                <p className={styles.couponOk}>
                  {appliedCoupon.code} applied — {appliedCoupon.label}
                </p>
              ) : null}
            </form>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 ? (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Coupon discount</span>
                  <span>-₹{discount}</span>
                </div>
              ) : null}
              <div className={styles.summaryRow}>
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
            </div>

            {checkoutError ? (
              <p className={styles.checkoutError} role="alert">
                {checkoutError}
              </p>
            ) : null}

            <button
              type="button"
              className={styles.checkout}
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Opening checkout…" : "Proceed to checkout"}
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
};

export default CartDrawer;
