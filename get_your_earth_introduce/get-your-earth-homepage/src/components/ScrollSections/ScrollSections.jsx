
import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollSections.css';

import cloudLensImage from '../../assets/mockup/cloudLens/darkMode.png';
import knowWeatherImage from '../../assets/mockup/knowWeather/darkMode.png';
import rockLensImage from '../../assets/mockup/rockLens/darkMode.png';
import watchPlanetImage from '../../assets/mockup/watchPlanet/darkMode.png';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    title: 'Cloud Lens',
    description: '보이는 구름에 대해 알아보세요. 사진을 찍기만 하면 앱이 구름에 대해 알려줍니다.',
    image: cloudLensImage,
  },
  {
    title: 'Know Weather',
    description: '습도부터 풍속까지, 현재 지역의 날씨를 과학적으로 설명해 드립니다.',
    image: knowWeatherImage,
  },
  {
    title: 'Rock Lens',
    description: '주변의 지질을 발견하세요. 암석 사진을 찍어 그것이 무엇인지 알아보세요.',
    image: rockLensImage,
  },
  {
    title: 'Watch Planet',
    description: '태양계를 3D로 탐험하세요. 행성을 클릭하여 자세히 알아보세요.',
    image: watchPlanetImage,
  },
];

const ScrollSections = () => {
  const component = useRef();
  const sectionRefs = useRef([]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      sectionRefs.current.forEach((section, index) => {
        const image = section.querySelector('.scroll-section-image');
        const text = section.querySelector('.scroll-section-text');

        gsap.fromTo(image, { opacity: 0, x: -100 }, {
          opacity: 1, x: 0, duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'center center',
            scrub: true,
          }
        });

        gsap.fromTo(text, { opacity: 0, x: 100 }, {
          opacity: 1, x: 0, duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'center center',
            scrub: true,
          }
        });
      });
    }, component);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={component} className="scroll-sections-container">
      {sections.map((section, index) => (
        <section key={index} className="scroll-section" ref={el => sectionRefs.current[index] = el}>
          <div className="scroll-section-image">
            <img src={section.image} alt={section.title} />
          </div>
          <div className="scroll-section-text">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </section>
      ))}
    </div>
  );
};

export default ScrollSections;
