
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import Gallery from './components/Gallery/Gallery';
import Download from './components/Download/Download';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <Gallery />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
