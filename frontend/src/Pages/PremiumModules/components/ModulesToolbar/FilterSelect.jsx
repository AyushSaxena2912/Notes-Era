import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./FilterSelect.module.css";

/**
 * Custom select — avoids native mobile pickers that ignore our dark theme.
 */
const FilterSelect = ({
  label,
  value,
  options = [],
  onChange,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || label}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.value}>{selected?.label}</span>
        <FiChevronDown className={styles.chevron} aria-hidden />
      </button>
      {open ? (
        <ul id={listId} className={styles.menu} role="listbox">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.option} ${
                    active ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span
                    className={`${styles.radio} ${
                      active ? styles.radioActive : ""
                    }`}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default FilterSelect;
