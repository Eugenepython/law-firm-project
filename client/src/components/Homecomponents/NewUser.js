//NewUser.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../CSScomponents/NewUser.css'; // Assuming you have a CSS file for styling

const NewUser = () => {
  return (
    <div className="new-user-container">
      <div className="image-container">
        <img src="/Symbol.jpeg" alt="Symbol" className="top-image" />
      </div>
      <h2>Create an Account for Your Company</h2>
      <nav>
        <ul className="nav-links">
          <li className="nav-item home-link"><Link to="/">Home</Link></li>
          <li className="nav-item lawfirm-link"><Link to="lawfirm-signup">Law Firm - Sign Up</Link></li>
          <li className="nav-item provider-link"><Link to="provider-signup">Disb Provider - Sign Up</Link></li>
        </ul>
      </nav>
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
};

export default NewUser;


