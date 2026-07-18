import Header from "./components/Header/Header";
import HeroSection from "./sections/HeroSection/HeroSection";
import PremiumModulesSection from "./sections/PremiumModulesSection/PremiumModulesSection";
import AboutSection from "./sections/AboutSection/AboutSection";
import PricingSection from "./sections/PricingSection/PricingSection";
import TestimonialSection from "./sections/TestimonialSection/TestimonialSection";
import FAQSection from "./sections/FAQSection/FAQSection";
import Footer from "./components/Footer/Footer";
import styles from "./PremiumModulesPage.module.css";

const PremiumModulesPage = () => {
  return (
    <div className={`${styles.container} fs-6`}>
      <Header />
      <main>
        <HeroSection />
        <PremiumModulesSection />
        <PricingSection />
        <TestimonialSection />
        <FAQSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default PremiumModulesPage;
