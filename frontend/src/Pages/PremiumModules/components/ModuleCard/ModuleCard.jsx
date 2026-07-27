import { useEffect, useState } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheck } from "react-icons/fa";
import {
  addToCart,
  getCart,
  removeFromCart,
  subscribeCartItems,
} from "../../../../utils/cart";
import {
  fetchOwnedModuleSlugs,
  isModuleOwned,
  subscribeOwnedModules,
} from "../../../../utils/ownedModules";
import { isStudentLoggedIn } from "../../../../utils/studentAuth";
import styles from "./ModuleCard.module.css";

const DEFAULT_COVER = "/Assets2/Premium-Modules/module-cover.png";

const ModuleCard = ({
  imgSrc = DEFAULT_COVER,
  link = "/",
  name,
  about,
  college,
  price,
  oldPrice,
  rating = 0,
  totalRatings = 0,
  repoId,
  slug,
  isBestSeller = false,
}) => {
  const itemId = `${repoId}-${slug}`;
  const [inCart, setInCart] = useState(() =>
    getCart().some((item) => item.id === itemId),
  );
  const [owned, setOwned] = useState(() => isModuleOwned(slug));
  const coverSrc = imgSrc || DEFAULT_COVER;
  const discount =
    oldPrice && price && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  useEffect(() => {
    const sync = (items) =>
      setInCart(items.some((item) => item.id === itemId));
    sync(getCart());
    return subscribeCartItems(sync);
  }, [itemId]);

  useEffect(() => {
    if (!isStudentLoggedIn()) {
      setOwned(false);
      return undefined;
    }
    setOwned(isModuleOwned(slug));
    fetchOwnedModuleSlugs().then((slugs) => setOwned(slugs.has(slug)));
    return subscribeOwnedModules((slugs) => setOwned(slugs.has(slug)));
  }, [slug]);

  const handleCartToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (owned) return;
    if (inCart) {
      removeFromCart(itemId);
      return;
    }
    addToCart({
      id: itemId,
      name,
      about,
      college,
      price,
      oldPrice,
      imgSrc: coverSrc,
      link,
      repoId,
      slug,
    });
  };

  return (
    <article className={styles.card}>
      <a href={link} className={styles.coverLink}>
        <div className={styles.cover}>
          {isBestSeller ? (
            <span className={styles.badge}>Bestseller</span>
          ) : null}
          <img
            src={coverSrc}
            alt={`${name} cover`}
            onError={(event) => {
              if (event.currentTarget.src.endsWith(DEFAULT_COVER)) return;
              event.currentTarget.src = DEFAULT_COVER;
            }}
          />
        </div>
      </a>

      <div className={styles.body}>
        <div className={styles.info}>
          <a href={link} className={styles.title}>
            {name}
          </a>

          <div className={styles.ratingRow}>
            <span className={styles.ratingValue}>{Number(rating).toFixed(1)}</span>
            <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
              {renderStars(rating)}
            </div>
            <a href={link} className={styles.reviews}>
              ({totalRatings})
            </a>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>
              {price != null ? `₹${price}` : "—"}
            </span>
            {oldPrice != null && price != null && oldPrice > price ? (
              <span className={styles.mrp}>₹{oldPrice}</span>
            ) : null}
            {discount > 0 ? (
              <span className={styles.discount}>{discount}% off</span>
            ) : null}
          </div>
        </div>

        {owned ? (
          <a
            href="/orders"
            className={`${styles.cartBtn} ${styles.ownedBtn}`}
            onClick={(event) => event.stopPropagation()}
          >
            <FaCheck />
            Already purchased
          </a>
        ) : (
          <button
            type="button"
            className={`${styles.cartBtn} ${inCart ? styles.cartBtnAdded : ""}`}
            onClick={handleCartToggle}
            aria-pressed={inCart}
            aria-label={
              inCart ? `Remove ${name} from cart` : `Add ${name} to cart`
            }
          >
            {inCart ? (
              <>
                <FaCheck />
                <span className={styles.addedLabel}>Added</span>
                <span className={styles.removeLabel}>Remove</span>
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        )}
      </div>
    </article>
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

export default ModuleCard;
