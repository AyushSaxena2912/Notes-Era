import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { fetchAuthMeta, signupStudent } from "../../../utils/studentAuth";
import AuthLayout from "./AuthLayout";
import styles from "./StudentAuth.module.css";

const OTHER_COLLEGE = "Other";

const DEFAULT_COLLEGES = [
  "Medi-Caps University",
  "IPS Academy",
  "Acropolis Institute",
  OTHER_COLLEGE,
];

const DEFAULT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const withOtherOption = (list = []) => {
  const cleaned = list.filter((item) => item && item !== OTHER_COLLEGE);
  return [...cleaned, OTHER_COLLEGE];
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [colleges, setColleges] = useState(DEFAULT_COLLEGES);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: DEFAULT_COLLEGES[0],
    customCollege: "",
    year: DEFAULT_YEARS[0],
    mobileNumber: "",
  });

  const isOtherCollege = form.college === OTHER_COLLEGE;
  const nextQuery = params.get("next")
    ? `?next=${encodeURIComponent(params.get("next"))}`
    : "";

  useEffect(() => {
    fetchAuthMeta()
      .then((meta) => {
        const nextColleges = withOtherOption(
          Array.isArray(meta?.colleges) && meta.colleges.length
            ? meta.colleges
            : DEFAULT_COLLEGES,
        );
        const nextYears =
          Array.isArray(meta?.years) && meta.years.length
            ? meta.years
            : DEFAULT_YEARS;
        setColleges(nextColleges);
        setYears(nextYears);
        setForm((prev) => ({
          ...prev,
          college: nextColleges.includes(prev.college)
            ? prev.college
            : nextColleges[0],
          year: nextYears.includes(prev.year) ? prev.year : nextYears[0],
        }));
      })
      .catch(() => {
        setColleges(DEFAULT_COLLEGES);
        setYears(DEFAULT_YEARS);
      });
  }, []);

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const collegeName = isOtherCollege
      ? form.customCollege.trim()
      : form.college;

    if (isOtherCollege && collegeName.length < 2) {
      setError("Please type your college / university name.");
      return;
    }

    setLoading(true);
    const { ok, data } = await signupStudent({
      name: form.name,
      email: form.email,
      password: form.password,
      college: collegeName,
      year: form.year,
      mobileNumber: form.mobileNumber,
    });
    setLoading(false);
    if (!ok) {
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        navigate(
          `/check-email?email=${encodeURIComponent(form.email.trim())}`,
          { replace: true },
        );
        return;
      }
      setError(data?.message || "Could not create account.");
      return;
    }
    navigate(
      `/check-email?email=${encodeURIComponent(form.email.trim())}`,
      { replace: true },
    );
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start learning with exam-focused Notes-Era modules."
      onGoogle={() =>
        setError(
          "Google sign-in will be available soon. Use email/password for now.",
        )
      }
      footer={
        <>
          Already have an account? <Link to={`/login${nextQuery}`}>Sign in</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Full Name
          <input
            className={styles.input}
            value={form.name}
            onChange={onChange("name")}
            required
            minLength={2}
            maxLength={80}
            placeholder="Your full name"
            autoComplete="name"
          />
        </label>

        <label className={styles.label}>
          Email Address
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          Mobile No
          <input
            className={styles.input}
            type="tel"
            inputMode="numeric"
            value={form.mobileNumber}
            onChange={onChange("mobileNumber")}
            required
            minLength={10}
            maxLength={10}
            placeholder="10-digit mobile"
            autoComplete="tel"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            College
            <select
              className={styles.select}
              value={form.college}
              onChange={onChange("college")}
              required
            >
              {colleges.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Year
            <select
              className={styles.select}
              value={form.year}
              onChange={onChange("year")}
              required
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isOtherCollege ? (
          <label className={styles.label}>
            College / University name
            <input
              className={styles.input}
              type="text"
              value={form.customCollege}
              onChange={onChange("customCollege")}
              required
              minLength={2}
              maxLength={120}
              placeholder="Type your college or university"
              autoComplete="organization"
            />
          </label>
        ) : null}

        <label className={styles.label}>
          Password
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              required
              minLength={8}
              placeholder="Min 8 chars, letter + number"
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
