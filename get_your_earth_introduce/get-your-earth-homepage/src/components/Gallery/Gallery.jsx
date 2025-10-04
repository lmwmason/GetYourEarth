
import React from 'react';
import './Gallery.css';
import mainPageImage from '../../assets/mockup/mainPage/darkMode.png';
import cloudLensImage from '../../assets/mockup/cloudLens/darkMode.png';
import knowWeatherImage from '../../assets/mockup/knowWeather/darkMode.png';
import rockLensImage from '../../assets/mockup/rockLens/darkMode.png';
import watchPlanetImage from '../../assets/mockup/watchPlanet/darkMode.png';

const galleryImages = [
  { src: mainPageImage, alt: 'Main Page' },
  { src: cloudLensImage, alt: 'Cloud Lens' },
  { src: knowWeatherImage, alt: 'Know Weather' },
  { src: rockLensImage, alt: 'Rock Lens' },
  { src: watchPlanetImage, alt: 'Watch Planet' },
];

const Gallery = () => {
  return (
    <section className="gallery-section">
        <div className="container">
            <h2 className="section-title">앱 스크린샷</h2>
            <div className="gallery-grid">
                {galleryImages.map((image, index) => (
                    <div key={index} className="gallery-item">
                        <img src={image.src} alt={image.alt} />
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default Gallery;
