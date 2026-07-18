import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./FAQSection.module.css";

const FAQS = [
  {
    q: "What are Notes-Era modules?",
    a: "Modules are exam-focused study notes for specific subjects — covering units, important topics, diagrams, and PYQ-style content you can buy as soft copies.",
  },
  {
    q: "How do I filter modules by college and year?",
    a: "Use the search and filters in the Modules section. Pick your college and year, or search by subject keywords like Machine Learning or IoT.",
  },
  {
    q: "What format do I receive after purchase?",
    a: "You get a soft copy of the module after checkout. Soft copies are delivered digitally so you can revise anytime.",
  },
  {
    q: "Can I add multiple modules to my cart?",
    a: "Yes. Use Add to Cart on any module card, then continue shopping. Your cart count updates in the header.",
  },
  {
    q: "Are free notes still available?",
    a: "Yes. You can browse free notes from the Free Notes CTA. Modules in the store are paid exam packs with deeper coverage.",
  },
  {
    q: "How do I contact support?",
    a: "Email us at noteseraa@gmail.com. We typically reply within a few hours on weekdays.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.section} id="faq">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>FAQ</p>
          <h2>Frequently asked questions</h2>
          <p className={styles.sub}>
            Everything you need to know about Notes-Era — can&apos;t find an
            answer? Reach out anytime.
          </p>
        </header>

        <div className={styles.list}>
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.q}
                className={`${styles.item} ${isOpen ? styles.open : ""}`}
              >
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <span className={styles.icon}>
                    <FiChevronDown />
                  </span>
                </button>
                <div className={styles.answerWrap}>
                  <p className={styles.answer}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.support}>
          <div>
            <strong>Still have questions?</strong>
            <p>We typically reply within a few hours on weekdays.</p>
          </div>
          <a href="mailto:noteseraa@gmail.com" className={styles.supportBtn}>
            Contact support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
