
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
        <div className="container">
            <h1 className="hero-title">Get Your Earth</h1>
            <p className="hero-subtitle">하늘의 구름부터 발 아래의 암석까지, 우리 주변의 세계를 탐험하세요.</p>
            <div className="hero-cta">
                <a href="#download" className="cta-button">앱 다운로드</a>
            </div>
        </div>
    </section>
  );
};

export default Hero;
