
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
        <div className="container">
            <p>&copy; 2025 GetYourEarth. All rights reserved.</p>
            <div className="footer-links">
                <a href="#">개인정보 처리방침</a>
                <a href="#">이용약관</a>
                <a href="#">문의하기</a>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
