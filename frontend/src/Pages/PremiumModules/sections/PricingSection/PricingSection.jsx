import { FiCheck } from "react-icons/fi";
import styles from "./PricingSection.module.css";

const PLANS = [
  {
    id: "semester",
    name: "Semester",
    description: "One semester of modules for your current year.",
    price: "₹499",
    period: "/semester",
    features: [
      "All modules for 1 semester",
      "Soft copies & updates",
      "College + year filters",
      "Email support",
    ],
    cta: "Get Semester Pass",
    featured: false,
  },
  {
    id: "year",
    name: "Year",
    description: "Full academic year access — best value for exams.",
    price: "₹999",
    period: "/year",
    features: [
      "All modules for the full year",
      "Both odd & even semesters",
      "Priority soft-copy delivery",
      "New modules included",
      "Priority support",
    ],
    cta: "Get Year Pass",
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "all-years",
    name: "All Years",
    description: "Every year & semester — one plan till you graduate.",
    price: "₹2,499",
    period: "one-time",
    features: [
      "All years + all semesters",
      "Lifetime soft-copy access",
      "Future modules unlocked",
      "Campus-wide subject coverage",
      "Dedicated support",
    ],
    cta: "Get All Years",
    featured: false,
  },
];

const PricingSection = () => {
  return (
    <section className={styles.section} id="pricing">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Pricing</p>
          <h2>Year & semester subscriptions</h2>
          <p className={styles.sub}>
            Pick a pass that matches your semester or full year unlock modules
            without buying one by one.
          </p>
        </header>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.card} ${
                plan.featured ? styles.featured : ""
              }`}
            >
              {plan.badge ? (
                <span className={styles.badge}>{plan.badge}</span>
              ) : null}

              <div className={styles.cardTop}>
                <h3>{plan.name}</h3>
                <p className={styles.desc}>{plan.description}</p>
                <p className={styles.priceRow}>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>{plan.period}</span>
                </p>
              </div>

              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span className={styles.check} aria-hidden="true">
                      <FiCheck />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#modules"
                className={`${styles.cta} ${
                  plan.featured ? styles.ctaPrimary : styles.ctaGhost
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
