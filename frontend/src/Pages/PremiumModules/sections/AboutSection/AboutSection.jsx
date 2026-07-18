import { useState } from "react";
import { FiCopy, FiCheck, FiInstagram, FiExternalLink } from "react-icons/fi";
import styles from "./AboutSection.module.css";

const PHONE = "+91 9111869645";
const EMAIL = "ayushsaxena2912@gmail.com";
const INSTAGRAM = "https://www.instagram.com/ayushsaxena2912/";
const PORTFOLIO = "https://github.com/AyushSaxena2912";

const STORY = [
  `Notes-Era started as just a group of around 550 students, previously named MU Study Zone, where I used to share notes and PDFs with my college mates through Google Drive.`,
  `Then one day, I got a request from a student — “Bhai, it’s not convenient to search everything on Drive again and again. Please make a website.”`,
  `And that’s where it all started.`,
  `I started planning to make a website, but there was a small problem — I had absolutely no idea how to make one. At that time, I was still stuck between C, C++, and Java, trying to figure out which one I should learn. Making a website was a completely different world for me.`,
  `So, I reached out to a few classmates from my section and requested them to help me build it. I told them I would pay whatever I could afford, but they said, “Bhai, paise nahi chahiye. Hum bana denge.”`,
  `But jitna easy ye sunne mein lag raha tha, utna tha nahi.`,
  `Mujhe us time thodi bahut Canva ke alawa kuch nahi aata tha, and suddenly I was trying to manage developers, design, content, and social media — basically everything. And when you don’t know much about something yourself, managing and leading multiple people becomes really difficult.`,
  `So I decided, theek hai, design main khud seekhta hoon.`,
  `I started learning UI/UX, took care of the designing part, and also handled the marketing. Slowly, we built an amazing team of people who gave their time and effort to Notes-Era.`,
  `We faced a lot of difficulties and a lot of competition. Humare aas-paas aur bhi notes ki websites bani, things didn’t always go according to plan, and there were many ups and downs.`,
  `But we never stopped.`,
  `We started by sharing notes for free, and eventually, on students’ demand, we introduced our Premium e-Modules specially created from an exam point of view.`,
  `But we didn’t stop there either.`,
  `We also started Printooo, with a simple idea — making printouts more convenient for students. We took it a step further and started delivering printouts right to their classroom doors. There was even a day when we printed and delivered around 7,000 pages in a single day.`,
  `From sharing PDFs on Google Drive to building Notes-Era, creating Premium e-Modules, and delivering thousands of printed pages through Printooo — we just kept trying new things to make things easier for students.`,
  `And this journey was definitely not mine alone.`,
  `There are countless people who helped me along the way. Some of the people who worked with me the most were my Co-Founder Itish Jain, Project Advisor Aniruddh Sharma, my tech team — Sanskar Soni, Arth Gupta, Jasneet Singh Saini, Sujal Soni, and Aradhya Tiwari; Content Management Lead Kulvinder Singh Juneja; Social Media & Marketing — Aditi Dalal, Ananya Rai, Shivam, Sakshi, Sonam Jha, Singh Bais, Sunidhi Shinde, Danisha Jagiran, and Aditya Maheshwari; and our Premium Notes Makers — Kritika Bhardwaj, Sunidhi Shinde, Danisha Jagiran, Aditya Maheshwari, and Diya Asnani, along with many more people who became a part of this journey.`,
  `But there were also some people who may not have been directly working on Notes-Era but were always there backstage, supporting me throughout this journey — Avani Shastri, Nivika Jain, Rishabh Maheshwari, Utkarsh Mishra, Krishna Agrawal, and Isha Maheshwari.`,
  `What started with a simple Google Drive and a group of 550 students became something much bigger than I had ever planned — a community of 6,000+ students with over 2.5 lakh views.`,
  `Along the way, I also lost a few friends who were once a part of this journey. I just hope that someday, somehow, our paths cross again.`,
  `And yeah… that’s how Notes-Era happened.`,
];

const PEOPLE = [
  "Jasneet Singh Saini",
  "Kulvinder Singh Juneja",
  "Kritika Bhardwaj",
  "Danisha Jagiran",
  "Aditya Maheshwari",
  "Rishabh Maheshwari",
  "Aniruddh Sharma",
  "Sunidhi Shinde",
  "Diya Asnani",
  "Aradhya Tiwari",
  "Krishna Agrawal",
  "Isha Maheshwari",
  "Utkarsh Mishra",
  "Avani Shastri",
  "Sanskar Soni",
  "Nivika Jain",
  "Ananya Rai",
  "Aditi Dalal",
  "Itish Jain",
  "Arth Gupta",
  "Sujal Soni",
  "Sonam Jha",
  "Singh Bais",
  "Sakshi",
  "Shivam",
];

const CATCHY = [
  "Bhai, it’s not convenient to search everything on Drive again and again. Please make a website.",
  "Bhai, paise nahi chahiye. Hum bana denge.",
  "a community of 6,000+ students with over 2.5 lakh views",
  "printed and delivered around 7,000 pages in a single day",
  "But jitna easy ye sunne mein lag raha tha, utna tha nahi.",
  "So I decided, theek hai, design main khud seekhta hoon.",
  "And yeah… that’s how Notes-Era happened.",
  "And this journey was definitely not mine alone.",
  "And that’s where it all started.",
  "But we didn’t stop there either.",
  "But we never stopped.",
];

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HIGHLIGHT_TOKENS = [
  ...CATCHY.map((text) => ({ text, type: "catchy" })),
  ...PEOPLE.map((text) => ({ text, type: "person" })),
].sort((a, b) => b.text.length - a.text.length);

const HIGHLIGHT_REGEX = new RegExp(
  `(${HIGHLIGHT_TOKENS.map((item) => escapeRegExp(item.text)).join("|")})`,
  "g",
);

const HIGHLIGHT_MAP = Object.fromEntries(
  HIGHLIGHT_TOKENS.map((item) => [item.text, item.type]),
);

function highlightStory(text) {
  const parts = text.split(HIGHLIGHT_REGEX);
  return parts.map((part, index) => {
    const type = HIGHLIGHT_MAP[part];
    if (type === "person") {
      return (
        <span key={`person-${index}`} className={styles.person}>
          {part}
        </span>
      );
    }
    if (type === "catchy") {
      return (
        <span key={`catchy-${index}`} className={styles.catchy}>
          {part}
        </span>
      );
    }
    return part;
  });
}

const AboutSection = () => {
  const [copied, setCopied] = useState(null);

  const copyText = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className={styles.section} id="about">
      <div className={`container ${styles.inner}`}>
        <header className={styles.top}>
          <p className={styles.eyebrow}>About</p>
          <h2>The Story Behind Notes-Era</h2>
          <p className={styles.lead}>
            From a Google Drive group of 550 students to a community of 6,000+
            — scroll the journey below.
          </p>
        </header>

        <div className={styles.shell}>
          <aside className={styles.profile}>
            <div className={styles.avatarRing}>
              <img
                className={styles.avatar}
                src="/Assets2/ayush-about.png"
                alt="Ayush Saxena"
              />
            </div>
            <h3 className={styles.name}>Ayush Saxena</h3>
            <p className={styles.role}>Founder · Notes-Era</p>
            <p className={styles.bio}>
              Full-stack developer and UI/UX designer.
            </p>

            <div className={styles.contacts}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyText(PHONE, "phone")}
                aria-label="Copy phone number"
              >
                <span>{PHONE}</span>
                {copied === "phone" ? <FiCheck /> : <FiCopy />}
              </button>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyText(EMAIL, "email")}
                aria-label="Copy email"
              >
                <span>{EMAIL}</span>
                {copied === "email" ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <div className={styles.socials}>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <FiInstagram />
                Instagram
              </a>
              <a
                href={PORTFOLIO}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <FiExternalLink />
                Portfolio
              </a>
            </div>
          </aside>

          <div className={styles.storyWrap}>
            <div className={styles.scroll} tabIndex={0}>
              {STORY.map((paragraph) => (
                <p key={paragraph.slice(0, 56)} className={styles.paragraph}>
                  {highlightStory(paragraph)}
                </p>
              ))}
            </div>
            <div className={styles.fade} aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
