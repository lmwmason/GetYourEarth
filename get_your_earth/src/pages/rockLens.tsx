import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai'; 

const FALLBACK_KEY: string = "YOUR_VALID_GEMINI_API_KEY_HERE"; 
let GEMINI_API_KEY: string = (process.env.REACT_APP_GEMINI_API_KEY as string | undefined) || FALLBACK_KEY; 

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY !== FALLBACK_KEY && GEMINI_API_KEY.length > 10) { 
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} 

interface RockAnalysisResult {
    rockType: string;
    analysisReport: string;
    reasoning: string;
}

const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const paragraphs = html.split(/\n\s*\n/).filter(p => p.trim() !== '');
    
    html = paragraphs.map(p => {
        let paragraphHtml = p.replace(/\n/g, '<br/>').trim();
        if (paragraphHtml.startsWith('- ') || paragraphHtml.startsWith('* ')) {
            paragraphHtml = paragraphHtml.replace(/^(\*|-)\s*(.*)/gm, '<li>$2</li>');
            return `<ul>${paragraphHtml}</ul>`;
        }
        return `<p>${paragraphHtml}</p>`;
    }).join('');
    return html;
};

const canvasToGenerativePart = (canvas: HTMLCanvasElement): { inlineData: { data: string; mimeType: string; }; } => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Data = dataUrl.split(',')[1];
    return {
        inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
        },
    };
};


const RockLens: React.FC = () => {
    const [result, setResult] = useState<RockAnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('초기화 중...');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const initWebcam = async () => {
            setLoading(true);
            setError(null);
            
            if (!ai) {
                setError('Gemini API 키가 유효하지 않거나 설정되지 않았습니다.');
                setLoading(false);
                setStatusMessage('오류 발생');
                return;
            }

            try {
                if (videoRef.current) {
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error("이 브라우저는 카메라를 지원하지 않습니다.");
                    }
                    setStatusMessage('카메라 활성화 중...');
                    const constraints = { video: { facingMode: "environment" }, audio: false };
                    
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().then(() => {
                            setIsWebcamReady(true);
                            setLoading(false);
                            setStatusMessage('촬영 준비 완료. 암석을 화면에 맞춰주세요.');
                        }).catch(e => {
                            throw new Error("비디오 재생 실패: " + e.message);
                        });
                    };
                }
            } catch (err: any) {
                setError(err.message || "초기화 실패");
                setLoading(false);
                setStatusMessage('오류 발생');
            }
        };

        initWebcam();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const analyzeRock = useCallback(async (imagePart: any) => {
        if (!ai) {
            throw new Error('Gemini API가 유효하지 않아 분석을 시작할 수 없습니다.');
        }

        setStatusMessage('암석 이미지 분석 및 보고서 생성 중...');
        
        const prompt = `
            당신은 암석학 및 지구과학 전문가입니다. 다음 이미지는 사용자가 캡처한 암석 사진입니다.
            
            1. **암석 분류**: 이미지를 분석하여 암석의 정확한 종류(예: 화강암, 현무암, 석회암, 편마암 등)를 유추하여 다음 JSON 형식에 맞춰 응답의 첫 부분에 넣어주세요. 암석의 종류는 최대한 구체적으로 분류해 주세요.

            ---JSON_START---
            {
                "rockType": "[분류된 암석의 이름]",
                "reasoning": "[이미지의 질감, 색상, 광물 결정 등 분류의 근거를 짧게 요약]"
            }
            ---JSON_END---

            2. **지구과학적 분석 보고서**: JSON 블록 다음에는 Google 검색 기능을 사용하여 최신 정보를 바탕으로 이 암석(${'{rockType}'} Placeholder)에 대한 상세한 학술적 분석 보고서를 작성해 주세요. 보고서는 다음 내용을 포함해야 합니다:
            
            * **기원 및 분류**: 암석의 생성 과정(화성, 퇴적, 변성) 및 그에 따른 상세 분류.
            * **주요 구성 광물**: 이 암석을 구성하는 주요 광물들과 그 특징.
            * **지구과학적 중요성**: 이 암석이 지구 역사, 지질 구조 해석, 또는 경제적/학술적으로 갖는 중요성.
            * **주요 산출지**: 전 세계 또는 한국의 주요 산출지 예시.
            
            설명은 명확하고 심도 있게 작성하며, 가독성을 위해 적절한 Markdown 형식과 문단 구성을 사용해 주세요.
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { role: 'user', parts: [imagePart, { text: prompt }] }
                ],
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });

            if (!response.text) {
                throw new Error("Gemini API가 텍스트 응답을 반환하지 않았습니다. (응답 없음)");
            }
            
            const fullText = response.text;
            const jsonStart = fullText.indexOf('---JSON_START---');
            const jsonEnd = fullText.indexOf('---JSON_END---');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("Gemini가 지정된 JSON 형식을 지키지 않았습니다.");
            }

            const jsonString = fullText.substring(jsonStart + '---JSON_START---'.length, jsonEnd).trim();
            const rockJson = JSON.parse(jsonString);
            const analysisText = fullText.substring(jsonEnd + '---JSON_END---'.length).trim();
            
            return {
                rockType: rockJson.rockType || '분류 실패',
                reasoning: rockJson.reasoning || '근거 없음',
                analysisReport: markdownToHtml(analysisText),
            };

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 API 오류';
            throw new Error(`Gemini 분석 보고서 생성 실패: ${errorMessage}`);
        }
    }, []);

    const handleSnapshot = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || !isWebcamReady || loading) {
            setError("웹캠이 준비되지 않았거나 이전 분석 중입니다.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height); 

            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);

            const imagePart = canvasToGenerativePart(canvas);
            
            analyzeRock(imagePart)
                .then(res => {
                    setResult(res);
                    setStatusMessage('분석 완료');
                })
                .catch(err => {
                    setError(err.message);
                    setStatusMessage('분석 오류');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    return (
        <div className="rock-lens-container">
            <h1>Rock Lens</h1>
            <p>카메라를 사용하여 암석을 촬영하고 지구과학적 분석 보고서를 받아보세요.</p>
            
            <div>
                <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto', minHeight: '300px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-color)', borderRadius: '8px' }}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      style={{ width: '100%', height: '100%', display: isWebcamReady ? 'block' : 'none', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    
                    {(!isWebcamReady || loading || error) && (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
                        {(loading || !isWebcamReady) && <p>{statusMessage}</p>}
                        {error && <p style={{ color: 'red', padding: '10px' }}>오류: {error}</p>}
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} style={{ display: 'none' }} /> 
                </div>

                <button 
                  onClick={handleSnapshot} 
                  disabled={!isWebcamReady || loading}
                >
                  {loading ? '분류 및 분석 진행 중...' : '촬영 및 분석 시작'}
                </button>
            </div>

            <hr/>

            <div className="result-area">
                {capturedImage && (
                    <div className="captured-image-preview">
                        <h2>캡처된 암석 이미지</h2>
                        <img src={capturedImage} alt="Captured Rock" />
                    </div>
                )}
                
                {result && !loading && (
                    <section className="prediction-box">
                        <h2>분석 결과 요약</h2>
                        <p><strong>감지된 암석 종류:</strong> {result.rockType}</p>
                        <p><strong>분류 근거 (Gemini):</strong> {result.reasoning}</p>
                        
                        <hr/>
                        
                        <h3>지구과학적 분석 보고서</h3>
                        <div dangerouslySetInnerHTML={{ __html: result.analysisReport }} />
                    </section>
                )}
            </div>
        </div>
    );
};

export default RockLens;