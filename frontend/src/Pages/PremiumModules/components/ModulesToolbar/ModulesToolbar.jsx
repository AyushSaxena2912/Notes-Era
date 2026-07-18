import { FiSearch, FiX } from "react-icons/fi";
import styles from "./ModulesToolbar.module.css";

const ModulesToolbar = ({
  query,
  onQueryChange,
  college,
  onCollegeChange,
  colleges,
  year,
  onYearChange,
  years,
  sort,
  onSortChange,
}) => {
  const hasFilters =
    query.trim() !== "" ||
    college !== colleges[0] ||
    year !== "all" ||
    sort !== "relevance";

  const clearAll = () => {
    onQueryChange("");
    onCollegeChange(colleges[0] || "Medi-Caps University");
    onYearChange("all");
    onSortChange("relevance");
  };

  return (
    <aside className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Name or keywords..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search modules"
        />
        {query ? (
          <button
            type="button"
            className={styles.clearQuery}
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
          >
            <FiX />
          </button>
        ) : null}
      </div>

      <label className={styles.field}>
        <span>Sort</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          aria-label="Sort"
        >
          <option value="relevance">Relevance</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Top Rated</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>College</span>
        <select
          value={college}
          onChange={(event) => onCollegeChange(event.target.value)}
          aria-label="College"
        >
          {colleges.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Year</span>
        <select
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          aria-label="Year"
        >
          <option value="all">All years</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {hasFilters ? (
        <button type="button" className={styles.reset} onClick={clearAll}>
          Clear all
        </button>
      ) : null}
    </aside>
  );
};

export default ModulesToolbar;
