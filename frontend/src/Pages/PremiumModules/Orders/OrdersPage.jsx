import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../../../utils/studentAuth";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./OrdersPage.module.css";

const SUPPORT_EMAIL = "noteseraa@gmail.com";
const SUPPORT_WHATSAPP_URL = "https://wa.me/message/GQDCCMOPAY62F1";

function formatModuleLabel(productId = "") {
  return String(productId)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const OrdersPage = () => {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const supportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { response, data } = await authFetch("/access/modules");
      if (cancelled) return;
      setLoading(false);
      if (!response.ok) {
        setError(data?.message || "Could not load orders.");
        return;
      }
      setModules(data?.body?.modules || []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supportOpen) return undefined;
    const onPointerDown = (event) => {
      if (!supportRef.current?.contains(event.target)) {
        setSupportOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSupportOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [supportOpen]);

  const openAccess = async (slug) => {
    const { response, data } = await authFetch(`/access/modules/${slug}`);
    if (!response.ok) {
      setError(data?.message || "Could not open module.");
      return;
    }
    const url = data?.body?.driveUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const supportMenu = (
    <div className={styles.supportWrap} ref={supportRef}>
      <button
        type="button"
        className={styles.supportBtn}
        aria-expanded={supportOpen}
        aria-haspopup="menu"
        onClick={() => setSupportOpen((open) => !open)}
      >
        Support
      </button>
      {supportOpen ? (
        <div className={styles.supportMenu} role="menu">
          <a
            className={styles.supportItem}
            role="menuitem"
            href={`mailto:${SUPPORT_EMAIL}`}
            onClick={() => setSupportOpen(false)}
          >
            <span>Email</span>
            <em>{SUPPORT_EMAIL}</em>
          </a>
          <a
            className={styles.supportItem}
            role="menuitem"
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSupportOpen(false)}
          >
            <span>WhatsApp</span>
            <em>+91 74005 66242</em>
          </a>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <p className={styles.eyebrow}>Account</p>
              <h1>My orders</h1>
            </div>
            {supportMenu}
          </div>
          <p className={styles.sub}>
            Open modules you purchased. Access lasts 6 months from purchase.
          </p>
        </header>

        {loading ? <p className={styles.muted}>Loading...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {!loading && !modules.length ? (
          <div className={styles.empty}>
            <p>No purchases yet.</p>
            <div className={styles.emptyActions}>
              <Link to="/#modules" className={styles.linkBtn}>
                Browse modules
              </Link>
            </div>
          </div>
        ) : null}

        <ul className={styles.list}>
          {modules.map((item) => (
            <li key={`${item.productId}-${item.orderId}`} className={styles.item}>
              <div className={styles.itemMeta}>
                <strong>{formatModuleLabel(item.productId)}</strong>
                <p>
                  {item.active ? "Active" : "Expired"} · until{" "}
                  {item.expiresAt
                    ? new Date(item.expiresAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <button
                type="button"
                className={styles.openBtn}
                disabled={!item.active}
                onClick={() => openAccess(item.productId)}
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
