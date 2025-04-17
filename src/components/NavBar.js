// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <NavLink to="/">Photo Journey</NavLink>
      </div>
      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/map">My Map</NavLink></li>
        <li><NavLink to="/itinerary">Travel Story</NavLink></li> {/* Updated text to reflect the blog style */}
        <li><NavLink to="/recommendations">Recommendations</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;