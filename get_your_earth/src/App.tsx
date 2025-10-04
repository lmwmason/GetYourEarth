import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import logo from './logo.png';
import './App.css';
import CloudLens from './pages/cloudLens'
import KnowWeather from './pages/knowWeather'
import RockLens from './pages/rockLens'
import WatchPlanet from './pages/watchPlanet'
import { Sun, Moon, Atom } from 'lucide-react';

declare global {
  interface Window {
    kakao_ad_area: {
      reloadAll: () => void;
    } | undefined;
  }
}

const getInitialColorMode = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const reloadKakaoAd = () => {
    if (window.kakao_ad_area && typeof window.kakao_ad_area.reloadAll === 'function') {
        window.kakao_ad_area.reloadAll();
    }
};

const App:React.FC = () => {

  useEffect(() => {
    let script: HTMLScriptElement | null = document.querySelector('script[src*="ba.min.js"]') as HTMLScriptElement | null;

    if (script) {
        reloadKakaoAd();
        return;
    }

    script = document.createElement("script") as HTMLScriptElement;
    
    script.setAttribute("src", "//t1.daumcdn.net/kas/static/ba.min.js");
    script.setAttribute("charset", "utf-8");
    script.setAttribute("async", "true");

    script.onload = () => {
        reloadKakaoAd();
    };

    document.body.appendChild(script);
    
    return () => {
        if (script) {
            script.onload = null;
        }
    };
  }, []);


  const [hash, setHash] = useState<string>(window.location.hash);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(getInitialColorMode);
  
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    document.body.className = colorMode === 'dark' ? 'dark-mode' : 'light-mode';
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (hash) {
      case '#cloudLens':
        return <CloudLens />;
      case '#knowWeather':
        return <KnowWeather />;
      case '#rockLens':
        return <RockLens />;
      case '#watchPlanet':
        return <WatchPlanet />;
      default:
        return (
          <>
            <h1 className="main-title">GET YOUR EARTH</h1>
            <img src={logo} className="App-logo" alt="logo" />
            <p className="subtitle">Know everything about earth</p>
            <div className="main-links">
                <a href={'#cloudLens'} className="main-link-item">Cloud Lens ☁️</a>
                <a href={'#knowWeather'} className="main-link-item">Know Weather 🌦️</a>
                <a href={'#rockLens'} className="main-link-item">Rock Lens 🪨</a>
                <a href={'#watchPlanet'} className="main-link-item">Watch Planet 🪐</a>
            </div>
          </>
        );
    }
  };
  
  const menuItems = [
    { label: "cloud lens", hash: "#cloudLens" },
    { label: "know weather", hash: "#knowWeather" },
    { label: "rock lens", hash: "#rockLens" },
    { label: "watch planet", hash: "#watchPlanet" },
  ];

  return(
    <div className="App">
      <div className="menu-container">
        <div className="menu-title">
          <a href="">get_your_earth</a>
          <button onClick={toggleColorMode} className="color-mode-toggle">
            {colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <div className="menu-list">
          {menuItems.map((item) => (
            <div
              key={item.hash}
              className={`menu-item ${hash === item.hash ? "active" : ""}`}
            >
              <a href={item.hash}>{item.label}</a>
              {hash === item.hash && <Atom size={12} className="active-indicator"/>} 
            </div>
          ))}
        </div>
      </div>

      <header className="App-header">
        {renderContent()}
      </header>
      <div className="ad-container">
                <ins className="kakao_ad_area"
                     data-ad-unit="DAN-44vrI4lFIUwbdtom"
                     data-ad-width="320"
                     data-ad-height="100"></ins>
            </div>
      <footer className="footer-area">
        <div className="buttom-word">
          <a href="https://github.com/lmwmason" target="_blank" rel="noopener noreferrer">@happy coding</a>
          <a href="mailto:lmwmason@naver.com">문의 : lmwmason@naver.com</a>
        </div>
      </footer>
    </div>
  );
}

export default App;