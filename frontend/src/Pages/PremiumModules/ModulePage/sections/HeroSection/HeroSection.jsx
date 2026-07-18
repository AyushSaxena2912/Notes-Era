import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRazorPay, loadRazorPay } from "../../../../../utils/razorpay";
import { openCashfreeCheckout } from "../../../../../utils/cashfree";
import {
  createOrder,
  verifyPayment,
  fetchModuleAccess,
} from "../../../../../utils/modules";
import {
  fetchOwnedModuleSlugs,
  isModuleOwned,
  markModulesOwned,
  subscribeOwnedModules,
} from "../../../../../utils/ownedModules";
import {
  getStudentUser,
  isStudentLoggedIn,
} from "../../../../../utils/studentAuth";
import styles from "./HeroSection.module.css";
import Spinner from "../../../components/Spinner/Spinner";
import { IoCopy } from "react-icons/io5";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { resolveModulePrices } from "../../../utils/moduleFilters";

const COVER = "/Assets2/Premium-Modules/module-cover.png";

const formatNewLine = (text = "") => text.replace(/\n/g, "<br />");

function buildSampleSlides(module) {
  const slides = [COVER];
  const previews = Array.isArray(module?.previews) ? module.previews : [];

  previews.forEach((item) => {
    const src = item?.previewSrc;
    if (
      typeof src === "string" &&
      src.trim() &&
      src !== COVER &&
      !slides.includes(src) &&
      !src.includes("undefined") &&
      !src.includes("null")
    ) {
      slides.push(src);
    }
  });

  return slides;
}

const HeroSection = ({ module, className, college }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGateway, setActiveGateway] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [driveUrl, setDriveUrl] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [owned, setOwned] = useState(() => isModuleOwned(module?.slug));
  const [openingOwned, setOpeningOwned] = useState(false);

  const { price, oldPrice } = resolveModulePrices(module);
  const rating = Number(module.rating) || 4.5;
  const totalRatings = Number(module.totalRatings) || 100;
  const discount =
    oldPrice && price && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;
  const slides = useMemo(() => buildSampleSlides(module), [module]);
  const topics = Array.isArray(module.topics) ? module.topics : [];
  const gatewayLabel =
    activeGateway === "razorpay" ? "Razorpay" : "Cashfree";

  useEffect(() => {
    setActiveSlide(0);
  }, [module?.slug]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length, module?.slug, activeSlide]);

  useEffect(() => {
    loadRazorPay();
  }, []);

  useEffect(() => {
    if (!module?.slug) return undefined;
    if (!isStudentLoggedIn()) {
      setOwned(false);
      return undefined;
    }
    setOwned(isModuleOwned(module.slug));
    fetchOwnedModuleSlugs().then((slugs) =>
      setOwned(slugs.has(module.slug)),
    );
    return subscribeOwnedModules((slugs) =>
      setOwned(slugs.has(module.slug)),
    );
  }, [module?.slug]);

  const copyText = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    setIsPaymentProcessing(false);
    markModulesOwned([module.slug]);
    setOwned(true);
    const { ok, data } = await fetchModuleAccess(module.slug);
    if (ok && data?.body?.driveUrl) {
      setDriveUrl(data.body.driveUrl);
    }
    setIsSuccessModalOpen(true);
  }, [module.slug]);

  const handleOpenOwned = useCallback(async () => {
    if (!isStudentLoggedIn()) {
      const next = `${location.pathname}${location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setPaymentError("");
    setOpeningOwned(true);
    const { ok, data } = await fetchModuleAccess(module.slug);
    setOpeningOwned(false);
    if (ok && data?.body?.driveUrl) {
      window.open(data.body.driveUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate("/orders");
  }, [module.slug, navigate, location.pathname, location.search]);

  const closeLoadingModal = useCallback(() => {
    setIsPaymentProcessing(false);
  }, []);

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (owned) {
      handleOpenOwned();
      return;
    }

    if (!isStudentLoggedIn()) {
      const next = `${location.pathname}${location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const student = getStudentUser();
    if (!student?.email) {
      setPaymentError("Please log in again to continue checkout.");
      return;
    }

    const buyer = {
      name: student.name || "",
      contactNumber: String(student.mobileNumber || "").replace(/\D/g, ""),
      email: student.email,
    };

    setPaymentError("");
    setIsPaymentProcessing(true);

    const order = await createOrder(module.slug, "soft");
    if (order?.isErr || !order?.token) {
      setIsPaymentProcessing(false);
      if (order?.status === 401) {
        const next = `${location.pathname}${location.search}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      if (order?.status === 409) {
        markModulesOwned([module.slug]);
        setOwned(true);
        setPaymentError("You already own this module.");
        return;
      }
      setPaymentError(order?.message || "Could not create payment order.");
      return;
    }

    const gateway = order.gateway || "razorpay";
    setActiveGateway(gateway);

    try {
      if (gateway === "cashfree") {
        const result = await openCashfreeCheckout({
          paymentSessionId: order.payment_session_id,
          mode: order.mode || "sandbox",
        });

        if (result?.error) {
          setIsPaymentProcessing(false);
          setPaymentError(
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
          handlePaymentSuccess,
        );

        if (!ok) {
          setIsPaymentProcessing(false);
          setPaymentError(
            data?.message ||
              "Payment could not be verified. If money was deducted, contact support.",
          );
        }
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
        notes: { ...buyer, purchaseType: "soft", id: module.slug },
        theme: { color: "#8D6CFC" },
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
            handlePaymentSuccess,
          );
          if (!ok) {
            setIsPaymentProcessing(false);
            setPaymentError(
              data?.message || "Payment could not be verified.",
            );
          }
        },
      });
      rzp.on("payment.failed", () => {
        setIsPaymentProcessing(false);
        setPaymentError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsPaymentProcessing(false);
      setPaymentError(err?.message || "Could not open payment checkout.");
    }
  }, [
    owned,
    module.slug,
    navigate,
    location.pathname,
    location.search,
    handlePaymentSuccess,
    handleOpenOwned,
  ]);

  return (
    <section className={`${styles.section} ${className || ""}`}>
      <div className={`container ${styles.wrapper}`}>
        <div className={styles.layout}>
          <aside className={styles.coverCol}>
            <div className={styles.coverSlider}>
              <div className={styles.coverFrame}>
                <img
                  src={slides[activeSlide] || COVER}
                  alt={`${module.name} sample ${activeSlide + 1}`}
                  onError={(event) => {
                    if (event.currentTarget.src.endsWith(COVER)) return;
                    event.currentTarget.src = COVER;
                  }}
                />
              </div>
              {slides.length > 1 ? (
                <div
                  className={styles.dots}
                  role="tablist"
                  aria-label="Sample pages"
                >
                  {slides.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={index === activeSlide}
                      aria-label={`Show sample ${index + 1}`}
                      className={`${styles.dot} ${
                        index === activeSlide ? styles.dotActive : ""
                      }`}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </aside>

          <div className={styles.mainCol}>
            <div className={styles.shelf}>
              <div className={styles.details}>
                <header className={styles.header}>
                  <p className={styles.eyebrow}>e-Module</p>
                  <h1 className={styles.title}>{module.name}</h1>
                  <div className={styles.metaLine}>
                    {college ? <span>{college}</span> : null}
                    {college ? <span className={styles.dotSep}>·</span> : null}
                    <span>Soft copy</span>
                    <span className={styles.dotSep}>·</span>
                    <span>Instant access</span>
                  </div>

                  <div
                    className={styles.ratingRow}
                    aria-label={`${rating} out of 5 stars`}
                  >
                    <span className={styles.ratingValue}>
                      {rating.toFixed(1)}
                    </span>
                    <div className={styles.stars}>{renderStars(rating)}</div>
                    <span className={styles.reviews}>({totalRatings})</span>
                  </div>
                </header>

                <div className={styles.purchaseBar}>
                  {owned ? (
                    <p className={styles.ownedNote}>
                      You already purchased this module.
                    </p>
                  ) : (
                    <div className={styles.priceRow}>
                      <span className={styles.price}>₹{price}</span>
                      {oldPrice > price ? (
                        <span className={styles.mrp}>₹{oldPrice}</span>
                      ) : null}
                      {discount > 0 ? (
                        <span className={styles.discount}>{discount}% off</span>
                      ) : null}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`${styles.buyBtn} ${
                      owned ? styles.ownedBtn : ""
                    }`}
                    onClick={owned ? handleOpenOwned : handlePurchase}
                    disabled={openingOwned}
                  >
                    {owned
                      ? openingOwned
                        ? "Opening..."
                        : "Open module"
                      : "Buy e-Module"}
                  </button>
                </div>

                {module.description ? (
                  <section className={styles.sectionBlock}>
                    <h2>About</h2>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: formatNewLine(module.description),
                      }}
                    />
                  </section>
                ) : null}

                {topics.length ? (
                  <section className={styles.sectionBlock}>
                    <h2>What&apos;s inside</h2>
                    <ol className={styles.topicList}>
                      {topics.map(({ title, description }, index) => (
                        <li key={`${title}-${index}`}>
                          <strong>{title}</strong>
                          {description ? <p>{description}</p> : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {paymentError ? (
          <p className={styles.paymentError} role="alert">
            {paymentError}
          </p>
        ) : null}
        <p className={styles.poweredBy}>
          Secure checkout powered by {gatewayLabel}
        </p>
      </div>

      {isPaymentProcessing ? (
        <div className={styles.loadingModalWrapper}>
          <div className={styles.loadingModal}>
            <Spinner size={50} />
          </div>
          <div className={styles.overlay} onClick={closeLoadingModal} />
        </div>
      ) : null}

      {isSuccessModalOpen ? (
        <div className={styles.loadingModalWrapper}>
          <div className={styles.popupContent}>
            <button
              type="button"
              className={styles.popupClose}
              onClick={closeSuccessModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2>Thank you</h2>
            <p>
              Your e-Module access is ready. You can also open it anytime from
              My orders. Access may take up to 10 minutes.
            </p>
            <div className={styles.successActions}>
              {driveUrl ? (
                <>
                  <a
                    href={driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.driveBtn}
                  >
                    Open Drive Link
                  </a>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyText(driveUrl)}
                    aria-label="Copy link"
                  >
                    <IoCopy size={20} />
                  </button>
                </>
              ) : (
                <a href="/orders" className={styles.driveBtn}>
                  Go to My orders
                </a>
              )}
            </div>
          </div>
          <div className={styles.overlay} onClick={closeSuccessModal} />
        </div>
      ) : null}
    </section>
  );
};

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars.push(<FaStar key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }
  return stars;
}

export default HeroSection;
