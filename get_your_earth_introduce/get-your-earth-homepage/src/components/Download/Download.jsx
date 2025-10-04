
import React from 'react';
import './Download.css';
import appleLogo from '../../assets/appleLogo.png';
import androidLogo from '../../assets/androidLogo.png';
import chromeLogo from '../../assets/chromeLogo.png';

const Download = () => {
  return (
    <section id="download" className="download-section">
        <div className="container">
            <h2 className="section-title">지금 GetYourEarth를 만나보세요</h2>
            <p className="download-subtitle">iOS, Android 및 웹에서 사용할 수 있습니다.</p>
            <div className="download-links">
                <a href="/build/app-ipa-68e0a220715d0-1759552032.ipa" className="download-button ios">
                    <img src={appleLogo} alt="Apple Logo" />
                    <span>App Store</span>
                </a>
                <a href="/build/app-apk-68e0a050223cb-1759551568.apk" className="download-button android">
                    <img src={androidLogo} alt="Android Logo" />
                    <span>Google Play</span>
                </a>
                <a href="https://get-your-earth.vercel.app/" target="_blank" rel="noopener noreferrer" className="download-button web">
                    <img src={chromeLogo} alt="Chrome Logo" />
                    <span>Web App</span>
                </a>
            </div>
        </div>
    </section>
  );
};

export default Download;
