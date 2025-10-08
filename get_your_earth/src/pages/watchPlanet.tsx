import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PlanetData {
  name: string;
  description: string;
  radius: number;
  color: number;
  distance: number;
  speed?: number;
}

interface PlanetDataMap {
  [key: string]: PlanetData;
}

const WatchPlanet: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true); 

  const planetData: PlanetDataMap = {
    sun: { name: '태양', description: '태양계의 중심에 있는 항성으로, 태양계 전체 질량의 99.86%를 차지합니다.', radius: 20, color: 0xfdb813, distance: 0 },
    mercury: { name: '수성', description: '태양에 가장 가까운 행성. 표면 온도는 낮에는 430°C, 밤에는 -180°C입니다.', radius: 2.5, color: 0x8c7853, distance: 40, speed: 4.74 },
    venus: { name: '금성', description: '두 번째로 태양에 가까운 행성. 두꺼운 대기로 인해 태양계에서 가장 뜨거운 행성입니다.', radius: 3.8, color: 0xffc649, distance: 60, speed: 3.50 },
    earth: { name: '지구', description: '우리가 살고 있는 행성. 액체 상태의 물이 존재하는 유일한 행성입니다.', radius: 4, color: 0x4a90e2, distance: 80, speed: 2.98 },
    mars: { name: '화성', description: '붉은 행성으로 알려진 화성. 산화철이 많아 붉게 보입니다.', radius: 3.2, color: 0xe27b58, distance: 100, speed: 2.41 },
    jupiter: { name: '목성', description: '태양계에서 가장 큰 행성. 대적점이라는 거대한 폭풍이 300년 이상 지속되고 있습니다.', radius: 11, color: 0xc88b3a, distance: 140, speed: 1.31 },
    saturn: { name: '토성', description: '아름다운 고리를 가진 행성. 고리는 얼음과 암석 조각으로 이루어져 있습니다.', radius: 9.5, color: 0xfad5a5, distance: 180, speed: 0.97 },
    uranus: { name: '천왕성', description: '옆으로 누워서 공전하는 특이한 행성. 메탄 대기로 인해 청록색을 띕니다.', radius: 6.5, color: 0x4fd0e7, distance: 220, speed: 0.68 },
    neptune: { name: '해왕성', description: '태양계에서 가장 먼 행성. 태양계에서 가장 강한 바람이 부는 곳입니다.', radius: 6.3, color: 0x4166f5, distance: 260, speed: 0.54 }
  };

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 200, 400);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    
    const canvasElement = renderer.domElement; 

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 3, 2000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    const planets: { [key: string]: THREE.Mesh } = {};
    const raycastTargets: THREE.Object3D[] = [];

    Object.entries(planetData).forEach(([key, data]) => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: data.color,
        emissive: key === 'sun' ? data.color : 0x000000,
        emissiveIntensity: key === 'sun' ? 0.5 : 0
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.name = key; 
      planet.userData = { key, ...data }; 
      
      scene.add(planet);
      planets[key] = planet;
      raycastTargets.push(planet);

      if (key !== 'sun') {
        planet.position.x = data.distance;
        
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints: number[] = [];
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          orbitPoints.push(
            Math.cos(angle) * data.distance,
            0,
            Math.sin(angle) * data.distance
          );
        }
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, opacity: 0.3, transparent: true });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        
        const helperGeometry = new THREE.SphereGeometry(data.radius * 2.5, 16, 16); 
        const helperMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const helper = new THREE.Mesh(helperGeometry, helperMaterial);
        helper.name = `${key}-helper`; 
        helper.userData = { key: key, isHelper: true }; 
        
        planet.add(helper); 
        raycastTargets.push(helper);
      }
    });

    const ringGeometry = new THREE.RingGeometry(13, 20, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xc9b58a, 
      side: THREE.DoubleSide,
      opacity: 0.6,
      transparent: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.name = 'saturn-ring'; 
    
    if (planets.saturn) {
        planets.saturn.add(ring); 
    } else {
        console.error("토성 객체가 초기화되지 않아 고리를 추가할 수 없습니다.");
    }
    

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = canvasElement.getBoundingClientRect(); 
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(raycastTargets, false); 

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        let selectedData: PlanetData | null = null;
        
        if (intersected.userData?.name) {
             selectedData = intersected.userData as PlanetData;
        } 
        else if (intersected.userData?.isHelper && intersected.userData.key) {
            const planetKey = intersected.userData.key as string;
            selectedData = planetData[planetKey]; 
        }

        if (selectedData) {
          setSelectedPlanet(selectedData);
          console.log('행성 선택 성공:', selectedData.name);
        } else {
          console.log('교차되었으나 행성 데이터 추출 실패');
        }

      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasElement.getBoundingClientRect(); 
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(raycastTargets, false);

      canvasElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    canvasElement.addEventListener('click', handleClick);
    canvasElement.addEventListener('mousemove', handleMouseMove);

    const angle: { [key: string]: number } = {};
    Object.keys(planetData).forEach(key => {
      if (key !== 'sun') angle[key] = Math.random() * Math.PI * 2;
    });

    const animate = () => {
      requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        planets.sun.rotation.y += 0.001;

        Object.entries(planetData).forEach(([key, data]) => {
          if (key !== 'sun' && data.speed) {
            angle[key] += 0.001 * data.speed;
            
            const x = Math.cos(angle[key]) * data.distance;
            const z = Math.sin(angle[key]) * data.distance;
            
            planets[key].position.x = x;
            planets[key].position.z = z;
            
            
            planets[key].rotation.y += 0.01;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('click', handleClick); 
      canvasElement.removeEventListener('mousemove', handleMouseMove);
      
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); 

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', background: '#111' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '1rem', borderRadius: '0.5rem', pointerEvents: 'auto', zIndex: 10 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>3D 태양계</h1>
        <button
          onClick={() => {
            const nextState = !isPlaying;
            setIsPlaying(nextState);
            isPlayingRef.current = nextState; 
          }}
          style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
        >
          {isPlaying ? '일시정지' : '재생'}
        </button>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#d1d5db' }}>행성을 클릭하여 정보를 확인하세요</p>
      </div>

      {selectedPlanet && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.9)', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '28rem', pointerEvents: 'auto', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedPlanet.name}</h2>
            <button
              onClick={() => setSelectedPlanet(null)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.25rem', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>
          <p style={{ color: '#d1d5db', lineHeight: 1.6 }}>{selectedPlanet.description}</p>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            {selectedPlanet.distance > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af' }}>태양으로부터의 거리:</span>
                  <span>{selectedPlanet.distance} 단위</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af' }}>공전 속도:</span>
                  <span>{selectedPlanet.speed} 배속</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>반지름:</span>
              <span>{selectedPlanet.radius} 단위</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPlanet;