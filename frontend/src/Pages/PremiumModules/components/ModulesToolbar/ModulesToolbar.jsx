import { FiSearch, FiX } from "react-icons/fi";
import FilterSelect from "./FilterSelect";
import styles from "./ModulesToolbar.module.css";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top Rated" },
];

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

  const collegeOptions = (colleges || []).map((item) => ({
    value: item,
    label: item,
  }));

  const yearOptions = [
    { value: "all", label: "All years" },
    ...(years || []).map((item) => ({ value: item, label: item })),
  ];

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

      <FilterSelect
        label="Sort"
        value={sort}
        options={SORT_OPTIONS}
        onChange={onSortChange}
        ariaLabel="Sort"
      />

      <FilterSelect
        label="College"
        value={college}
        options={collegeOptions}
        onChange={onCollegeChange}
        ariaLabel="College"
      />

      <FilterSelect
        label="Year"
        value={year}
        options={yearOptions}
        onChange={onYearChange}
        ariaLabel="Year"
      />

      {hasFilters ? (
        <button type="button" className={styles.reset} onClick={clearAll}>
          Clear all
        </button>
      ) : null}
    </aside>
  );
};

export default ModulesToolbar;
