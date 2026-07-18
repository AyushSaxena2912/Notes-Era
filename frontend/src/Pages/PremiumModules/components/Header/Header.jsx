import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { getCartCount, subscribeCart } from "../../../../utils/cart";
import {
  getStudentUser,
  getUserInitials,
  isStudentLoggedIn,
  logoutStudent,
  subscribeStudentAuth,
} from "../../../../utils/studentAuth";
import CartDrawer from "../CartDrawer/CartDrawer";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Modules", href: "/#modules" },
  { label: "About", href: "/#about" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(() => getStudentUser());
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = Boolean(user) || isStudentLoggedIn();

  useEffect(() => {
    const closeNavOnLg = () => {
      if (window.innerWidth >= 990) setIsNavOpen(false);
    };
    window.addEventListener("resize", closeNavOnLg);
    return () => window.removeEventListener("resize", closeNavOnLg);
  }, []);

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeCart(setCartCount);
  }, []);

  useEffect(() => {
    setUser(getStudentUser());
    return subscribeStudentAuth(setUser);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;
    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logoutStudent();
    setUser(null);
    navigate("/");
  };

  const initials = getUserInitials(user);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            <img src="/Assets2/lightLogo.png" alt="Notes-Era" />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {NAV_LINKS.map((link) => (
                <li
                  key={link.label}
                  className={
                    link.href === "/" && location.pathname === "/"
                      ? styles.activeLink
                      : undefined
                  }
                >
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <CartButton
              count={cartCount}
              onClick={() => setIsCartOpen(true)}
            />
            {loggedIn ? (
              <>
                <Link to="/orders" className={styles.textLink}>
                  Orders
                </Link>
                <div className={styles.profileWrap} ref={profileRef}>
                  <button
                    type="button"
                    className={styles.avatarBtn}
                    aria-label="Open profile menu"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    onClick={() => setIsProfileOpen((open) => !open)}
                  >
                    <span className={styles.avatar}>{initials}</span>
                  </button>
                  {isProfileOpen ? (
                    <div className={styles.menu} role="menu">
                      <div className={styles.menuHead}>
                        <span className={styles.menuName}>
                          {user?.name || "Student"}
                        </span>
                        <span className={styles.menuEmail}>{user?.email}</span>
                      </div>
                      <Link
                        to="/profile"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile &amp; settings
                      </Link>
                      <Link
                        to="/orders"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My orders
                      </Link>
                      <button
                        type="button"
                        className={styles.menuLogout}
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.textLink}>
                  Log in
                </Link>
                <Link to="/signup" className={styles.cta}>
                  Sign up
                </Link>
              </>
            )}
            <button
              type="button"
              className={`${styles.menuBtn} ${isNavOpen ? styles.navOpen : ""}`}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isNavOpen}
              onClick={() => setIsNavOpen((open) => !open)}
            >
              <span className={`${styles.menuBar} ${styles.menuBar1}`} />
              <span className={`${styles.menuBar} ${styles.menuBar2}`} />
              <span className={`${styles.menuBar} ${styles.menuBar3}`} />
            </button>
          </div>
        </div>

        {isNavOpen ? (
          <nav className={styles.mobNav} aria-label="Mobile">
            <ul className={styles.mobList}>
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={() => setIsNavOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
              {loggedIn ? (
                <>
                  <li>
                    <Link to="/profile" onClick={() => setIsNavOpen(false)}>
                      Profile &amp; settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => setIsNavOpen(false)}>
                      Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={styles.mobLogout}
                      onClick={() => {
                        setIsNavOpen(false);
                        handleLogout();
                      }}
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={() => setIsNavOpen(false)}>
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" onClick={() => setIsNavOpen(false)}>
                      Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        ) : null}
      </header>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

const CartButton = ({ count, onClick }) => (
  <button
    type="button"
    className={styles.cartBtn}
    aria-label="Open cart"
    onClick={onClick}
  >
    <FaShoppingCart />
    {count > 0 ? <span className={styles.cartBadge}>{count}</span> : null}
  </button>
);

export default Header;
