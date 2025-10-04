
import React from 'react';
import './Features.css';
import FeatureCard from './FeatureCard';

const featuresData = [
  {
    title: 'Cloud Lens',
    description: '보이는 구름에 대해 알아보세요. 사진을 찍기만 하면 앱이 구름에 대해 알려줍니다.',
    icon: '☁️'
  },
  {
    title: 'Know Weather',
    description: '습도부터 풍속까지, 현재 지역의 날씨를 과학적으로 설명해 드립니다.',
    icon: '🌡️'
  },
  {
    title: 'Rock Lens',
    description: '주변의 지질을 발견하세요. 암석 사진을 찍어 그것이 무엇인지 알아보세요.',
    icon: '🪨'
  },
  {
    title: 'Watch Planet',
    description: '태양계를 3D로 탐험하세요. 행성을 클릭하여 자세히 알아보세요.',
    icon: '🪐'
  }
];

const Features = () => {
  return (
    <section id="features" className="features-section">
        <div className="container">
            <h2 className="section-title">Discover the world with GetYourEarth</h2>
            <div className="features-grid">
                {featuresData.map((feature, index) => (
                    <FeatureCard key={index} title={feature.title} description={feature.description} icon={feature.icon} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default Features;
