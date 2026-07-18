import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./AccessFAQSection.module.css";

const FAQS = [
  {
    q: "How do I access this module after buying?",
    a: "As soon as your payment is successful, you’ll receive an email with the access link to your notes. You can also open the module anytime from the Orders list on the website.",
  },
  {
    q: "How long will I have access?",
    a: "You get 6 months of access to the digital e-Module. Use the link from your email or open it from your Orders list whenever you need during this period.",
  },
  {
    q: "Payment went through, but I still don’t have access. What should I do?",
    a: "Access can take up to 10 minutes after payment to be granted, so please wait a little. If you still don’t receive access after that (and the amount was deducted), contact us and we’ll resolve the issue immediately.",
  },
];

const AccessFAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.section} id="access-faq">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Access</p>
          <h2>How to access your module</h2>
          <p className={styles.sub}>
            How you get the link after payment, how to open it from Orders, and
            what to do if access is delayed.
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
            <strong>Still no access after 10 minutes?</strong>
            <p>Email us — we’ll resolve the issue immediately.</p>
          </div>
          <a href="mailto:noteseraa@gmail.com" className={styles.supportBtn}>
            Contact support
          </a>
        </div>
      </div>
    </section>
  );
};

export default AccessFAQSection;
