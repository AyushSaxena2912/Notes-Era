import { useState, useEffect } from "react";
import ModuleCard from "../ModuleCard/ModuleCard";
import ModulesCarousel from "../ModulesCarousel/ModulesCarousel";
import { resolveModulePrices } from "../../utils/moduleFilters";
import styles from "./modulesection.module.css";

const ModuleSection = ({
  name,
  about,
  college,
  modules = [],
  isRelatedMods = false,
  slug,
}) => {
  const [sectionModules, setSectionModules] = useState([]);

  useEffect(() => {
    const list = Array.isArray(modules) ? modules : [];
    if (isRelatedMods) {
      setSectionModules(list.filter((mod) => mod.slug !== slug));
    } else {
      setSectionModules(list);
    }
  }, [modules, isRelatedMods, slug]);

  if (!sectionModules.length) return null;

  const header = (
    <div className={styles.headerText}>
      <h2>{name}</h2>
      <p>
        {isRelatedMods
          ? "Unit-wise notes, important topics & PYQs"
          : about
            ? about
                .replace(
                  /\s*[-–—]?\s*Available in Hard Copy and Soft Copy Formats\.?/gi,
                  "",
                )
                .replace(/Soft Copy/gi, "")
                .replace(/\s{2,}/g, " ")
                .trim()
            : null}
      </p>
    </div>
  );

  const cards = sectionModules.map((module, index) => {
    const { price, oldPrice } = resolveModulePrices(module);
    return (
      <ModuleCard
        key={module.slug || index}
        imgSrc="/Assets2/Premium-Modules/module-cover.png"
        link={`/premium-modules/${module.repoId}/${module.slug}`}
        name={module.name}
        about={module.about}
        college={module.college || college}
        isBestSeller={index === 0}
        oldPrice={oldPrice}
        price={price}
        rating={module.rating || 4.5}
        totalRatings={module.totalRatings || 100}
        repoId={module.repoId}
        slug={module.slug}
      />
    );
  });

  return (
    <div className={styles.section}>
      <ModulesCarousel header={header}>{cards}</ModulesCarousel>
    </div>
  );
};

export default ModuleSection;
