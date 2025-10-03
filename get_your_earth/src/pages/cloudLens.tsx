import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const URL = "https://teachablemachine.withgoogle.com/models/FzE_D6OTT/"; 

const CLASS_NAMES = [
  "Cirrus",
  "Cumulus",
  "Cumulonimbus",
  "Altostratus",
  "Nimbostratus"
];

const cloudDescriptions: Record<string, string> = {
  Cirrus: "권운(Cirrus): 얇고 흰 실 같은 구름으로, 날씨가 곧 변할 수 있다는 신호입니다.",
  Cumulus: "적운(Cumulus): 솜뭉치 같은 흰 구름으로 대체로 맑은 날씨를 의미합니다.",
  Cumulonimbus: "적란운(Cumulonimbus): 거대한 수직 발달 구름으로, 폭우·뇌우·돌풍을 동반할 수 있습니다.",
  Altostratus: "고층운(Altostratus): 잿빛 구름으로 햇빛을 희미하게 가리며, 비나 눈을 예고합니다.",
  Nimbostratus: "난층운(Nimbostratus): 두껍고 어두운 비구름으로, 지속적인 강수를 동반합니다."
};

type InputSize = [number, number];

const CloudLens: React.FC = () => {
  const [prediction, setPrediction] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const modelInputShapeRef = useRef<InputSize>([224, 224]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");

      try {
        const modelURL = URL + "model.json";
        
        const model = await tf.loadLayersModel(modelURL);
        modelRef.current = model;
        
        const inputShape = model.inputs[0].shape as (number | null)[];
        if (inputShape.length === 4 && inputShape[1] !== null && inputShape[2] !== null) {
            modelInputShapeRef.current = [inputShape[1], inputShape[2]] as InputSize;
        }
        
        if (videoRef.current) {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("이 브라우저는 카메라를 지원하지 않습니다.");
          }

          const constraints = { 
            video: {
              facingMode: "environment"
            },
            audio: false
          };

          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                setIsWebcamReady(true);
              }).catch(e => {
                setError("비디오 재생 실패: " + e.message);
              });
            };
            
          } catch (cameraErr: any) {
            let errorMsg = "카메라 접근 실패\n";
            errorMsg += "오류 타입: " + cameraErr.name + "\n";
            
            if (cameraErr.name === 'NotAllowedError') {
              errorMsg += "카메라 권한을 허용해주세요.";
            } else if (cameraErr.name === 'NotFoundError') {
              errorMsg += "카메라를 찾을 수 없습니다.";
            } else if (cameraErr.name === 'NotReadableError') {
              errorMsg += "카메라가 다른 앱에서 사용 중입니다.";
            } else {
              errorMsg += cameraErr.message;
            }
            
            throw new Error(errorMsg);
          }
        }
        
      } catch (err: any) {
        setError(err.message || "초기화 실패");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const classifyImage = async (imageCanvas: HTMLCanvasElement) => {
    const model = modelRef.current;
    if (!model) {
      setError("모델이 로드되지 않았습니다.");
      return;
    }
    
    setLoading(true);
    setPrediction("");
    setDescription("");
    
    let tensor: tf.Tensor3D | null = null;
    let predictions: tf.Tensor | null = null; 
    
    try {
        tensor = tf.browser.fromPixels(imageCanvas)
            .resizeBilinear(modelInputShapeRef.current)
            .toFloat()
            .div(tf.scalar(127.5))
            .sub(tf.scalar(1))
            .expandDims(0);

        predictions = model.predict(tensor) as tf.Tensor;
        const result = await predictions.data();
        
        const maxProbIndex = result.indexOf(Math.max(...(result as Float32Array)));
        
        const bestClassName = CLASS_NAMES[maxProbIndex];
        const bestProbability = result[maxProbIndex];
        
        setPrediction(bestClassName);
        setConfidence(Math.round(bestProbability * 100));
        setDescription(cloudDescriptions[bestClassName] || "설명이 없습니다.");

    } catch (err) {
      setError("구름 분석 중 오류가 발생했습니다.");
    } finally {
        if (tensor) tensor.dispose();
        if (predictions) predictions.dispose();
        tf.dispose(); 
        setLoading(false);
    }
  };

  const handleSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !isWebcamReady || loading) {
        setError("웹캠이 준비되지 않았거나 분석 중입니다.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height); 

        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);

        classifyImage(canvas);
    }
  };

  return (
    <div className="cloud-lens-container">
      <h1>Cloud Lens</h1>
      <p>구름의 종류와 설명을 보여줍니다.</p>
      
      <div className="webcam-and-capture-area">
        
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto', minHeight: '300px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-color)', borderRadius: '8px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              style={{ width: '100%', height: '100%', display: isWebcamReady ? 'block' : 'none', objectFit: 'cover', borderRadius: '8px' }}
            />
            
            {(!isWebcamReady || error) && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
                {loading && <p>모델 및 웹캠 활성화 중...</p>}
                {error && <p style={{ color: 'red', padding: '10px' }}>오류: {error}</p>}
                {!loading && !error && <p>카메라 권한을 요청합니다...</p>}
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} /> 
        </div>

        <button 
          onClick={handleSnapshot} 
          disabled={!isWebcamReady || loading}
        >
          {loading ? '분석 중...' : '촬영 및 분석'}
        </button>
      </div>

      <div className="result-area">
        {capturedImage && (
            <div className="captured-image-preview">
                <h2>캡처된 이미지</h2>
                <img src={capturedImage} alt="Captured Cloud"/>
            </div>
        )}
        
        {prediction && !loading && (
          <section className="prediction-box">
            <h2>분석 결과</h2>
            <p><strong>감지된 구름 종류:</strong> {prediction}</p>
            <p><strong>신뢰도:</strong> {confidence}%</p>
            
            <h3>상세 설명</h3>
            <p>{description}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default CloudLens;