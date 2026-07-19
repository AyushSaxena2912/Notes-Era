import { useState, useEffect, useMemo } from "react";
import ModuleCard from "../../components/ModuleCard/ModuleCard";
import ModulesCarousel from "../../components/ModulesCarousel/ModulesCarousel";
import ModulesToolbar from "../../components/ModulesToolbar/ModulesToolbar";
import styles from "./PremiumModulesSection.module.css";
import { fetchAllRepos } from "../../../../utils/modules.js";
import FALLBACK_REPOS from "../../data/fallbackRepos";
import {
  normalizeRepos,
  flattenModules,
  filterAndSortModules,
  groupModulesByYear,
  groupModulesBySubject,
  resolveModulePrices,
  resolveModuleImage,
  YEAR_OPTIONS,
  COLLEGE_OPTIONS,
} from "../../utils/moduleFilters";

const renderModuleCard = (module, index, bestSeller) => {
  const { price, oldPrice } = resolveModulePrices(module);
  return (
    <ModuleCard
      key={`${module.repoId}-${module.slug}-${index}`}
      imgSrc={resolveModuleImage(module)}
      link={`/premium-modules/${module.repoId}/${module.slug}`}
      name={module.name}
      about={module.about}
      college={module.college}
      isBestSeller={bestSeller}
      oldPrice={oldPrice}
      price={price}
      rating={module.rating || 4.5}
      totalRatings={module.totalRatings || 100}
      repoId={module.repoId}
      slug={module.slug}
    />
  );
};

const SubjectBlock = ({ subject, modules, bestSellerOffset = false }) => {
  const header = (
    <div className={styles.subjectHeader}>
      <h4 className={styles.subjectHeading}>{subject}</h4>
      <p className={styles.subjectHint}>
        Unit-wise notes, important topics & PYQs
      </p>
    </div>
  );

  const cards = modules.map((module, index) =>
    renderModuleCard(module, index, bestSellerOffset && index === 0),
  );

  // Always carousel so mobile shows 2 cards + swipe/arrows for the rest
  return (
    <div className={styles.subjectBlock}>
      <ModulesCarousel header={header}>{cards}</ModulesCarousel>
    </div>
  );
};

const PremiumModulesSection = () => {
  const [repos, setRepos] = useState(() => normalizeRepos(FALLBACK_REPOS));
  const [query, setQuery] = useState("");
  const [college, setCollege] = useState(COLLEGE_OPTIONS[0]);
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await fetchAllRepos();
      if (cancelled) return;

      if (!data?.isErr && Array.isArray(data?.body) && data.body.length) {
        setRepos(normalizeRepos(data.body));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onShopFilter = (event) => {
      const detail = event.detail || {};
      if (typeof detail.query === "string") setQuery(detail.query);
      if (detail.college) setCollege(detail.college);
      if (detail.year) setYear(detail.year);
    };
    window.addEventListener("notesera-shop-filter", onShopFilter);
    return () => window.removeEventListener("notesera-shop-filter", onShopFilter);
  }, []);

  const allModules = useMemo(() => flattenModules(repos), [repos]);
  const colleges = COLLEGE_OPTIONS;
  const years = YEAR_OPTIONS;

  const filteredModules = useMemo(
    () =>
      filterAndSortModules(allModules, {
        query,
        college,
        year,
        sort,
      }),
    [allModules, query, college, year, sort],
  );

  const yearSections = useMemo(() => {
    if (year !== "all") return null;
    return groupModulesByYear(filteredModules).filter(
      (section) => section.modules.length > 0,
    );
  }, [year, filteredModules]);

  const subjectSections = useMemo(() => {
    if (year === "all") return null;
    return groupModulesBySubject(filteredModules);
  }, [year, filteredModules]);

  return (
    <section className={styles.container} id="modules">
      <header className={styles.sectionHeader}>
        <h2>All e-Modules</h2>
        <p>
          Get exam-focused e-Modules specially crafted for B.Tech CSE/IT
          students. Each PDF is organized unit-wise and topic-wise, with
          important topics clearly marked and PYQs highlighted so you know
          exactly what to study for your exams.
        </p>
      </header>

      <div className={styles.shopLayout}>
        <ModulesToolbar
          query={query}
          onQueryChange={setQuery}
          college={college}
          onCollegeChange={setCollege}
          colleges={colleges}
          year={year}
          onYearChange={setYear}
          years={years}
          sort={sort}
          onSortChange={setSort}
        />

        <div className={styles.shopMain}>
          {filteredModules.length ? (
            yearSections ? (
              <div className={styles.yearSections}>
                {yearSections.map((section, sectionIndex) => (
                  <section
                    key={section.year}
                    className={styles.yearSection}
                    aria-labelledby={`year-section-${section.year}`}
                  >
                    <h3
                      id={`year-section-${section.year}`}
                      className={styles.yearHeading}
                    >
                      {section.year}
                    </h3>
                    <div className={styles.subjectList}>
                      {section.subjects.map((subjectGroup, subjectIndex) => (
                        <SubjectBlock
                          key={subjectGroup.subject}
                          subject={subjectGroup.subject}
                          modules={subjectGroup.modules}
                          bestSellerOffset={
                            sectionIndex === 0 && subjectIndex === 0
                          }
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.subjectList}>
                {subjectSections.map((subjectGroup, subjectIndex) => (
                  <SubjectBlock
                    key={subjectGroup.subject}
                    subject={subjectGroup.subject}
                    modules={subjectGroup.modules}
                    bestSellerOffset={subjectIndex === 0}
                  />
                ))}
              </div>
            )
          ) : (
            <div className={styles.resultsBar}>
              <p className={styles.emptyText}>
                No modules found. Try another search, college, or year.
              </p>
            </div>
          )}
        </div>
      </div>

    </section>
  );
};

export default PremiumModulesSection;
