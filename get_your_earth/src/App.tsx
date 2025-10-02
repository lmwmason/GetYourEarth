import React from 'react';
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import logo from './logo.png';
import './App.css';
import CloudLens from './pages/cloudLens'
import KnowWeather from './pages/knowWeather'
import RockLens from './pages/rockLens'
import WatchPlanet from './pages/watchPlanet'

const App:React.FC = () => {
  const [hash, setHash] = useState<string>(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
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
            <h1>GET YOUR EARTH</h1>
            <img src={logo} className="App-logo" alt="logo" />
            <p></p>
            <a href={'#cloudLens'}>Cloud Lens</a>
            <a href={'#knowWeather'}>Know Weather</a>
            <a href={'#rockLens'}>Rock Lens</a>
            <a href={'#watchPlanet'}>Watch Planet</a>
          </>
        );
    }
  };
  return(
    <div className="App">
      <div className="menu-container">
        <div className="menu-title">
          <a href="">get_your_earth</a>
        </div>
        <div className="menu-list">
          {[
            { label: "cloud lens", hash: "#cloudLens" },
            { label: "know weather", hash: "#knowWeather" },
            { label: "rock lens", hash: "#rockLens" },
            { label: "watch planet", hash: "#watchPlanet" },
          ].map((item) => (
            <div
              key={item.hash}
              className={`menu-item ${hash === item.hash ? "active" : ""}`}
            >
              <a href={item.hash}>{item.label}</a>
            </div>
          ))}
        </div>
      </div>

      <header className="App-header">
        {renderContent()}
      </header>
      
      <div className="buttom-word">
        <a href="https://github.com/lmwmason">@happy coding</a>
        <p></p>
        <a href="lmwmason@naver.com">문의 : lmwmason@naver.com</a>
      </div>
    </div>
  );
}

export default App;
