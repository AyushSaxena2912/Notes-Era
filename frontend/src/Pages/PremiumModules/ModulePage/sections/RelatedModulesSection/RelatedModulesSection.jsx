import ModuleSection from "../../../components/ModulesSection/ModuleSection";
import { extractCollege } from "../../../utils/moduleFilters";
import styles from "./RelatedModulesSection.module.css";

const RelatedModulesSection = ({ repo, slug }) => {
  return (
    <section className={`${styles.section} container`}>
      {repo ? (
        <ModuleSection
          name={repo.name}
          about={repo.about}
          college={extractCollege(repo.about)}
          modules={repo.modules}
          isRelatedMods
          slug={slug}
        />
      ) : null}
    </section>
  );
};

export default RelatedModulesSection;
