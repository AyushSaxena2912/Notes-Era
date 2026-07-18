/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditData.css'; // Import your CSS stylesimport axios from 'axios';
import Cookies from 'js-cookie';
import axios from 'axios';

const EditData = () => {
  const BASE_URL='https://notesera-basic-backend-d3bk.onrender.com'
  // Use the useParams hook to get the ID of the data you want to edit
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State variables for form fields
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [link, setLink] = useState('');
  const [subject, setSubject] = useState('');


  // Fetch the existing data based on the ID when the component mounts
  useEffect(() => {
    // Make an API call to fetch the data based on the ID and set the state variables
    axios.get(`${BASE_URL}s/data/${id}`)
      .then((response) => {
        const data = response.data;
        setCollege(data.college);
        setYear(data.year);
        setType(data.type);
        setSubject(data.subject);
        setLink(data.link);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [id]); // Run this effect when the ID parameter changes

  // Handle form submission (update the existing data)
  const handleEdit = (e) => {
    e.preventDefault();
    
    // Construct the updated data object
    const updatedData = {
      college,
      year,
      type,
      subject,
      link,
    };

    // Make an API call to update the data
    axios.put(`${BASE_URL}s/data/${id}`, updatedData,{
      headers: {
        Authorization: `Bearer ${Cookies.get("notestoken")}`,
      }
    })
      .then((response) => {
        // Handle success, e.g., redirect to a success page or show a success message
        console.log('Data updated successfully!', response.data.message);
        window.alert("Data Updated Successfully");
        navigate('/noteslogin/dashboard');
      })
      .catch((error) => {
        console.error('Error updating data:', error);
        navigate('/noteslogin');
      });
  };

  return (
    <div className="edit-data-container2">
      <h2>Edit Data</h2>
      <form onSubmit={handleEdit}>
        <div className="form-group2">
          <label className='label2' htmlFor="college">College Name:</label>
          <input
            type="text"
            id="college"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={year}
            className='select2'
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <br/>      
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={type}
            className='select2'
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="Notes">Notes</option>
            <option value="Assignment">Assignment</option>
            <option value="MST1">MST1</option>
            <option value="MST2">MST2</option>
            <option value="End Sem">End Sem</option>
          </select>
        </div>
        <br/> 
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <br/>
        <div className="form-group">
          <label htmlFor="link">Link:</label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />
        </div>
        <br/>
        <button className='submt-btn2' type="submit">Edit</button>
      </form>
    </div>
  );
};

export default EditData;
