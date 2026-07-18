import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changeStudentPassword,
  fetchAuthMeta,
  fetchStudentMe,
  getStudentUser,
  logoutStudent,
  updateStudentProfile,
} from "../../../utils/studentAuth";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./ProfilePage.module.css";

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const cached = getStudentUser();
  const [colleges, setColleges] = useState(DEFAULT_COLLEGES);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const collegeInList = (value, list) =>
    list.some((item) => item === value && item !== OTHER_COLLEGE);

  const [form, setForm] = useState(() => {
    const college = cached?.college || DEFAULT_COLLEGES[0];
    const known = collegeInList(college, DEFAULT_COLLEGES);
    return {
      name: cached?.name || "",
      email: cached?.email || "",
      college: known ? college : OTHER_COLLEGE,
      customCollege: known ? "" : college,
      year: cached?.year || DEFAULT_YEARS[0],
      mobileNumber: cached?.mobileNumber || "",
    };
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isOtherCollege = form.college === OTHER_COLLEGE;

  useEffect(() => {
    fetchStudentMe().then((user) => {
      if (!user) return;
      setForm((prev) => {
        const known = collegeInList(user.college, colleges);
        return {
          ...prev,
          name: user.name || "",
          email: user.email || "",
          college: known ? user.college : OTHER_COLLEGE,
          customCollege: known ? "" : user.college || "",
          year: user.year || prev.year,
          mobileNumber: user.mobileNumber || "",
        };
      });
    });

    fetchAuthMeta().then((meta) => {
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
    });
  }, []);

  const onForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const onPass = (key) => (event) => {
    setPassForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    const collegeName = isOtherCollege
      ? form.customCollege.trim()
      : form.college;
    if (isOtherCollege && collegeName.length < 2) {
      setProfileErr("Please type your college / university name.");
      return;
    }
    setSavingProfile(true);
    const { ok, data } = await updateStudentProfile({
      name: form.name.trim(),
      college: collegeName,
      year: form.year,
      mobileNumber: form.mobileNumber.trim(),
    });
    setSavingProfile(false);
    if (!ok) {
      setProfileErr(data?.message || "Could not update profile.");
      return;
    }
    setProfileMsg("Profile saved.");
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPassErr("");
    setPassMsg("");
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassErr("New passwords do not match.");
      return;
    }
    setSavingPass(true);
    const { ok, data } = await changeStudentPassword({
      currentPassword: passForm.currentPassword,
      newPassword: passForm.newPassword,
    });
    setSavingPass(false);
    if (!ok) {
      setPassErr(data?.message || "Could not change password.");
      return;
    }
    setPassMsg("Password updated.");
    setPassForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = async () => {
    await logoutStudent();
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={`container ${styles.main}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h1>Profile</h1>
          <p className={styles.sub}>
            Update your details, change password, or log out.
          </p>
        </header>

        <section className={styles.card}>
          <h2>Personal info</h2>
          <form className={styles.form} onSubmit={handleProfileSave}>
            <label className={styles.label}>
              Full name
              <input
                className={styles.input}
                value={form.name}
                onChange={onForm("name")}
                required
                minLength={2}
                maxLength={80}
              />
            </label>

            <div className={styles.label}>
              Email
              <p className={styles.emailLocked}>{form.email || "—"}</p>
              <span className={styles.hint}>Email can&apos;t be changed.</span>
            </div>

            <label className={styles.label}>
              Mobile
              <input
                className={styles.input}
                type="tel"
                inputMode="numeric"
                value={form.mobileNumber}
                onChange={onForm("mobileNumber")}
                required
                minLength={10}
                maxLength={10}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                College
                <select
                  className={styles.select}
                  value={form.college}
                  onChange={onForm("college")}
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
                  onChange={onForm("year")}
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
                  value={form.customCollege}
                  onChange={onForm("customCollege")}
                  required
                  minLength={2}
                  maxLength={120}
                />
              </label>
            ) : null}

            {profileErr ? <p className={styles.error}>{profileErr}</p> : null}
            {profileMsg ? <p className={styles.success}>{profileMsg}</p> : null}

            <button className={styles.primary} type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Change password</h2>
          <form className={styles.form} onSubmit={handlePasswordSave}>
            <label className={styles.label}>
              Current password
              <input
                className={styles.input}
                type="password"
                value={passForm.currentPassword}
                onChange={onPass("currentPassword")}
                required
                autoComplete="current-password"
              />
            </label>
            <label className={styles.label}>
              New password
              <input
                className={styles.input}
                type="password"
                value={passForm.newPassword}
                onChange={onPass("newPassword")}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 chars, letter + number"
              />
            </label>
            <label className={styles.label}>
              Confirm new password
              <input
                className={styles.input}
                type="password"
                value={passForm.confirmPassword}
                onChange={onPass("confirmPassword")}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>

            {passErr ? <p className={styles.error}>{passErr}</p> : null}
            {passMsg ? <p className={styles.success}>{passMsg}</p> : null}

            <button className={styles.primary} type="submit" disabled={savingPass}>
              {savingPass ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Session</h2>
          <p className={styles.sub}>Sign out of Notes-Era on this device.</p>
          <button
            type="button"
            className={styles.danger}
            onClick={handleLogout}
          >
            Log out
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
