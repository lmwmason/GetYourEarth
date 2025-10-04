
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ScrollSections from './components/ScrollSections/ScrollSections';
import Download from './components/Download/Download';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <ScrollSections />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
