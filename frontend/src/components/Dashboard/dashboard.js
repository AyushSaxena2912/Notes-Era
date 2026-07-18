/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './Dashboard.css'; // You can create a CSS file for Dashboard styling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../UI/button';
import Cookies from 'js-cookie';
const Dashboard = () => {
  const BASE_URL='https://notesera-basic-backend-d3bk.onrender.com'
  const navigate = useNavigate();
  
  // State to manage the list of data
  const [dataList, setDataList] = useState([]);

  // State for filter values
  const [collegeFilter, setCollegeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Security feature
  // Function to handle data deletion
  const handleback=()=>{
    Cookies.remove('notestoken');
    navigate('/');
  }
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete the data?");
    if (confirmed){
      try {
        // Make a DELETE request to your server to delete the data entry
        await axios.delete(`${BASE_URL}/data/${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("notestoken")}`,
          }
        });
    
        // Remove the deleted data entry from the local state (dataList)
        const updatedList = dataList.filter((data) => data._id !== id);
        setDataList(updatedList);
        
        
      } catch (error) {
        // Handle errors, e.g., display an error message
        console.error('Error deleting data:', error);
        navigate('/noteslogin');
      }
    }
  };



  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/data/all`); 
      setDataList(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 
  useEffect(() => {
    // // Check if the token is present in LocalStorage
    // const token = localStorage.getItem('token');

    // if (!token) {
    //   // If token is not found, redirect to login
    //   navigate('/login9874Notes');
    // } else {
    //   // If token is found, you can fetch data or perform other actions
    //   fetchData();
    // }
    fetchData();
  }, []);


  // Filter the data based on filter criteria
  const filteredData = dataList.filter((data) =>
    data.college.toLowerCase().includes(collegeFilter.toLowerCase()) &&
    data.year.toString().includes(yearFilter) &&
    data.type.toLowerCase().includes(typeFilter.toLowerCase())
  );



  const dataCards = filteredData.length > 0 ? (
    filteredData.map((data) => (
      <div className="data-card1" key={data._id}>
        <div className="card-header1">
          <h3>{data.college}</h3>
        </div>
        <div className="card-body1">
          <p>Year: {data.year}</p>
          <p>Type: {data.type}</p>
          <p>Subject: {data.subject}</p>
          <p>Link: {data.link}</p>
        </div>
        <div className="card-actions1">
          <button className="edit-button1" onClick={() => navigate(`/noteslogin/dashboard/edit-data/${data._id}`)}>Edit</button>
          <button className="delete-button1" onClick={() => handleDelete(data._id)}>Delete</button>
        </div>
      </div>
    ))
  ) : (
    <div>No data available.</div>
  );

  return (
    <div>
      <div className="user-dashboard1">
        <h2>User Dashboard</h2>
        <button className='addData' onClick={() => navigate('/noteslogin/dashboard/add-data')}>Add Data</button>
        <Button onClick={handleback}>back/logout</Button>
        <br />
        <br />
  
        {/* Filter boxes */}
        <h2>Filter your Data</h2>
        <div className="filters1">
          <input
            type="text"
            placeholder="College"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          {/* Add filter functionality here */}
        </div>
  
        <div className="data-card-container1">
          {dataCards}
        </div>
      </div>
      </div>
  );
};

export default Dashboard;
