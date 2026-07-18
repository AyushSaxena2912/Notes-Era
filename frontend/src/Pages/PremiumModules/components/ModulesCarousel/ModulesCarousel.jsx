import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./ModulesCarousel.module.css";

const ModulesCarousel = ({ header, children }) => {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(maxScroll > 8 && el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    const sync = () => updateNav();
    sync();
    const raf = window.requestAnimationFrame(sync);
    const t = window.setTimeout(sync, 120);
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(sync);
      observer.observe(el);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      observer?.disconnect();
    };
  }, [children, updateNav]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll roughly one “page” (2 cards on mobile, more on desktop)
    el.scrollBy({
      left: dir * Math.max(el.clientWidth * 0.92, 220),
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.header}>{header}</div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollByDir(-1)}
            disabled={!canPrev}
            aria-label="Previous modules"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollByDir(1)}
            disabled={!canNext}
            aria-label="Next modules"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {children}
      </div>
    </div>
  );
};

export default ModulesCarousel;
