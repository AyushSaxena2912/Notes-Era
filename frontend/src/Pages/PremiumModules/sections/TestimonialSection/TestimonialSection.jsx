import { useEffect, useMemo, useRef, useState } from "react";
import ReviewCard from "./ReviewCard";
import styles from "./TestimonialSection.module.css";
import reviews, { AVATAR_COLORS } from "./reviews";

/** One entry per person in data (animation may clone for seamless scroll). */
const uniqueReviews = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const chunkRows = (items, rowCount = 3) => {
  const rows = Array.from({ length: rowCount }, () => []);
  items.forEach((item, index) => {
    rows[index % rowCount].push({ ...item, colorIndex: index });
  });
  return rows;
};

const MarqueeRow = ({ items, direction = "right", animate }) => {
  // Clone track for seamless marquee only — not duplicate data entries.
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className={styles.row}>
      <div
        className={`${styles.track} ${
          direction === "left" ? styles.trackLeft : styles.trackRight
        } ${animate ? styles.trackRunning : ""}`}
      >
        {loopItems.map((review, index) => (
          <ReviewCard
            key={`${review.name}-${index}`}
            name={review.name}
            role={review.role}
            review={review.review}
            avatar={review.avatar}
            color={AVATAR_COLORS[review.colorIndex % AVATAR_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
};

const TestimonialSection = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const rows = useMemo(() => chunkRows(uniqueReviews(reviews), 3), []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Testimonials</p>
          <h2>What Others Are Saying</h2>
          <p className={styles.sub}>
            Real stories from students who used Notes-Era modules — their exam
            wins, last-minute saves, and smoother prep speak louder than we
            ever could.
          </p>
        </header>
      </div>

      <div className={styles.rail}>
        <div className={styles.fadeLeft} aria-hidden />
        <div className={styles.fadeRight} aria-hidden />
        <div className={styles.rows}>
          <MarqueeRow items={rows[0]} direction="right" animate={visible} />
          <MarqueeRow items={rows[1]} direction="left" animate={visible} />
          <MarqueeRow items={rows[2]} direction="right" animate={visible} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
