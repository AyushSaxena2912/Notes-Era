import { useState } from "react";
import styles from "./ReviewCard.module.css";

const PREVIEW_LENGTH = 140;

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const ReviewCard = ({ name, role, review, color, avatar }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const showPhoto = Boolean(avatar) && !imgFailed;

  const needsTruncation = review.length > PREVIEW_LENGTH;
  const body =
    !needsTruncation || expanded
      ? review
      : `${review.slice(0, PREVIEW_LENGTH).trim()}...`;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div
          className={styles.avatar}
          style={{ background: color || "#8b5cf6" }}
          aria-hidden
        >
          {showPhoto ? (
            <img
              className={styles.avatarImg}
              src={avatar}
              alt=""
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
        <div className={styles.meta}>
          <strong>{name}</strong>
          <span>{role}</span>
        </div>
      </header>
      <p className={styles.review}>
        {body}
        {needsTruncation ? (
          <>
            {" "}
            <button
              type="button"
              className={styles.readMore}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </>
        ) : null}
      </p>
    </article>
  );
};

export default ReviewCard;
