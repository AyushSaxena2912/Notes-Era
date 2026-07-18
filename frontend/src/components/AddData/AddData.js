/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './AddData.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
const AddData = () => {
  const BASE_URL='https://notesera-basic-backend-d3bk.onrender.com'
  const navigate = useNavigate();

  const initialFormData = {
    college: '',
    year: '1',
    type: 'Notes',
    subject: '',
    link: '',
  };
  
  const [formData, setFormData] = useState(initialFormData);
  // const addPasskey = process.env.REACT_APP_ADD_PASSKEY;

  // useEffect(() => {
  //   // Check if the token is present in LocalStorage
  //   const token = localStorage.getItem('token');

  //   if (!token) {
  //     // If token is not found, redirect to login
  //     navigate('/login9874Notes');
  //   }
  // }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const userPasskey = window.prompt('Enter Passkey');

      // if (userPasskey === addPasskey) {
      //   // If the passkey matches, proceed to redirect the user to the dashboard
      //   await axios.post('${BASE_URL}/data/add', formData);
      //   setFormData(initialFormData);
      //   window.alert('Data added successfully');
      // } else {
      //   window.alert('Invalid Passkey');
      // }
      await axios.post(`${BASE_URL}/data/add`, formData,{
        headers: {
          Authorization: `Bearer ${Cookies.get("notestoken")}`,
        },
      });
      setFormData(initialFormData);
      window.alert('Data added successfully');
      
    } catch (error) {
      // Handle errors
      console.error('Error adding data:', error);
      navigate('/noteslogin');
    }
  };


  return (
    <div className="add-data-container3">
      <h2>Add Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group3">
          <label htmlFor="college">College Name:</label>
          <input
            type="text"
            id="college"
            name='college'
            value={formData.college}
            onChange={handleChange}
          />
        </div>
        <div className="form-group3">
          <label htmlFor="year">Year:</label>
          <select
            type="number"
            id="year"
            name='year'
            className='select3'
            value={formData.year}
            onChange={handleChange}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="form-group3">
          <label htmlFor="type">Type:</label>
          <select
            type="text"
            id="type"
            name='type'
            className='select3'
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Notes">Notes</option>
            <option value="Assignment">Assignment</option>
            <option value="MST1">MST1</option>
            <option value="MST2">MST2</option>
            <option value="End Sem">End Sem</option>
          </select>
        </div>
        <div className="form-group3">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name='subject'
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div className="form-group3">
          <label htmlFor="link">Link:</label>
          <input
            type="text"
            id="link"
            name='link'
            value={formData.link}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <br/>
      <p className="Back-Link"><a href="/noteslogin/dashboard"> ← Back to Dashboard</a></p>
    </div>
  );
};

export default AddData;