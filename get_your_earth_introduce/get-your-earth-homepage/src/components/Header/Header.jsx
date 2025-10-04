
import React, { useState } from 'react';
import './Header.css';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="main-header">
        <div className="container">
            <nav className="main-nav">
                <a href="/" className="logo">
                    <img src={logo} alt="GetYourEarth Logo" />
                    <span>GetYourEarth</span>
                </a>
                <button className="menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? '✖' : '☰'}
                </button>
                <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <li><a href="#features">주요 기능</a></li>
                    <li><a href="#download">다운로드</a></li>
                    <li><a href="https://get-your-earth.vercel.app/" target="_blank" rel="noopener noreferrer">웹 앱</a></li>
                </ul>
            </nav>
        </div>
    </header>
  );
};

export default Header;
