import React, { useEffect, useState } from "react";
import "./Courses.css";
import Select from "react-select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { authFetch } from "../../utils/studentAuth";
/* eslint-disable react-hooks/exhaustive-deps */

function Courses() {
  const [submitbuttonclicked, setSubjectbutton] = useState(false);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [years, setYears] = useState([]);
  const [types, setTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");

  const fetchColleges = async () => {
    try {
      const { response, data } = await authFetch("/free-notes/colleges");
      if (!response.ok) {
        setError(data?.message || "Could not load colleges.");
        setIsLoadingColleges(false);
        return;
      }
      const list = Array.isArray(data) ? data : data?.body || [];
      const collegeData = list.map((college) => ({
        value: college,
        label: college,
      }));
      setColleges(collegeData);
      setIsLoadingColleges(false);
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setError("Could not load colleges.");
      setIsLoadingColleges(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleCollegeChange = (selectedOption) => {
    setSelectedCollege(selectedOption);
    setSelectedYear(null);
    setSelectedType(null);
    setSubjects([]);
    authFetch(`/free-notes/${encodeURIComponent(selectedOption.value)}/years`)
      .then(({ response, data }) => {
        if (!response.ok) return;
        const list = Array.isArray(data) ? data : data?.body || [];
        setYears(
          list.map((year) => ({
            value: year,
            label: year,
          })),
        );
      })
      .catch((err) => console.error("Error fetching years:", err));
  };

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption);
    setSelectedType(null);
    setSubjects([]);
    authFetch(
      `/free-notes/${encodeURIComponent(selectedCollege.value)}/${encodeURIComponent(selectedOption.value)}/types`,
    )
      .then(({ response, data }) => {
        if (!response.ok) return;
        const list = Array.isArray(data) ? data : data?.body || [];
        setTypes(
          list.map((type) => ({
            value: type,
            label: type,
          })),
        );
      })
      .catch((err) => console.error("Error fetching types:", err));
  };

  const handleTypeChange = (selectedOption) => {
    setSelectedType(selectedOption);
  };

  const fetchSubjects = async () => {
    if (selectedCollege && selectedYear && selectedType) {
      setSubjectbutton(true);
      try {
        const { response, data } = await authFetch(
          `/free-notes/${encodeURIComponent(selectedCollege.value)}/${encodeURIComponent(selectedYear.value)}/${encodeURIComponent(selectedType.value)}/subjects`,
        );
        if (!response.ok) {
          setError(data?.message || "Could not load subjects.");
          setSubjectbutton(false);
          return;
        }
        const subjectsData = Array.isArray(data) ? data : data?.body || [];
        setSubjects(subjectsData);
        setSubjectbutton(false);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjectbutton(false);
      }
    }
  };

  const openSubjectLink = async (subject) => {
    if (selectedCollege && selectedYear && selectedType && subject) {
      try {
        const { response, data } = await authFetch(
          `/free-notes/${encodeURIComponent(selectedCollege.value)}/${encodeURIComponent(selectedYear.value)}/${encodeURIComponent(selectedType.value)}/${encodeURIComponent(subject)}/links`,
        );
        if (!response.ok) {
          setError(data?.message || "Could not open notes.");
          return;
        }
        const links = Array.isArray(data) ? data : data?.body || [];
        if (links.length > 0) {
          window.open(links[0].link, "_blank");
        }
      } catch (err) {
        console.error("Error fetching links:", err);
      }
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "8px",
      borderColor: "#FFD32B",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        borderColor: "#e0cd04",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#AF69EE" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "#AF69EE",
        color: "white",
      },
    }),
  };

  return (
    <div className="main-body">
      <div className="container">
        <h1>Get Your Notes Here!</h1>
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <div id="dropdown-container">
          {isLoadingColleges && <Skeleton height="40px" />}
          {!isLoadingColleges && (
            <div className="dropdown">
              <Select
                value={selectedCollege}
                onChange={handleCollegeChange}
                options={colleges}
                placeholder="Select College"
                styles={customSelectStyles}
              />
            </div>
          )}
          {isLoadingColleges && <Skeleton height="40px" />}
          {!isLoadingColleges && (
            <div className="dropdown">
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                options={years}
                placeholder="Select Year"
                styles={customSelectStyles}
              />
            </div>
          )}
          {isLoadingColleges && <Skeleton height="40px" />}
          {!isLoadingColleges && (
            <div className="dropdown">
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                options={types}
                placeholder="Select Type"
                styles={customSelectStyles}
              />
            </div>
          )}
        </div>

        <div className="button-div">
          <button id="submitBtn" onClick={fetchSubjects}>
            Submit
          </button>
        </div>

        <div className="subjects-container">
          {submitbuttonclicked && <Skeleton count={5} />}
          {!submitbuttonclicked &&
            subjects.map((subject, index) => (
              <div
                key={index}
                className="subject-rectangle"
                onClick={() => openSubjectLink(subject)}
              >
                {subject}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;
