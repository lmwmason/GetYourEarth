import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { GoogleGenAI } from '@google/genai'; 
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface AnalysisResult {
    city: string;
    temp: number;
    humidity: number;
    pressure: number;
    description: string;
    analysis: string;
}

const FALLBACK_KEY: string = "YOUR_VALID_GEMINI_API_KEY_HERE"; 

let GEMINI_API_KEY: string = (process.env.REACT_APP_GEMINI_API_KEY as string | undefined) || FALLBACK_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY !== FALLBACK_KEY && GEMINI_API_KEY.length > 10) { 
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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


const KnowWeather: React.FC = () => {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cityName, setCityName] = useState<string>('');

    const getLocationAndCity = useCallback(async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ko`
                        );
                        const data = await response.json();
                        
                        const city = data.address?.city || 
                                   data.address?.town || 
                                   data.address?.village || 
                                   data.address?.county || 
                                   '알 수 없는 위치';
                        
                        resolve(city);
                    } catch (err) {
                        reject(new Error('위치 정보를 도시명으로 변환하는데 실패했습니다.'));
                    }
                },
                (err) => {
                    reject(new Error(`위치 정보를 가져오는데 실패했습니다: ${err.message}`));
                }
            );
        });
    }, []);

    const fetchAndAnalyzeWeather = useCallback(async (city: string) => {
        if (!ai) {
            setError('API 키가 유효하지 않거나 설정되지 않았습니다. 코드를 확인해 주세요.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        const prompt = `
            현재 ${city}의 날씨를 Google 검색 기능을 사용하여 확인해 주세요.
            확인한 날씨 정보(온도, 습도, 기압, 전반적 상태)를 바탕으로, 다음 JSON 형식에 맞춰 응답의 첫 부분에 넣어주세요.

            ---JSON_START---
            {
                "city": "${city}",
                "temp": [현재 온도 값 (숫자만, 섭씨)],
                "humidity": [현재 습도 값 (숫자만, %)],
                "pressure": [현재 기압 값 (숫자만, hPa)],
                "description": "[전반적인 날씨 상태 (예: 맑음, 흐리고 비)]"
            }
            ---JSON_END---

            JSON 블록 다음에는, 당신은 설명하는 지구과학 전문가로서,
            위의 날씨 데이터를 기반으로 **지구과학적 원리**를 중심으로 상세하게 분석하여 설명해 주세요.
            분석 내용은 다음 세 가지 요소를 반드시 포함해야 합니다.
            1. **온도와 습도:** 포화수증기량, 이슬점 등과 연결하여 설명.
            2. **기압:** 고기압/저기압과 공기의 상승/하강 운동을 설명.
            3. **전반적인 날씨 상태:** 구름 생성이나 전선 등과 연결하여 설명.
            
            설명은 명확하고 학술적이며, 가독성을 위해 문단별로 정리하여 Markdown 형식으로 작성해 주세요.
        `;

        let fullText = '';
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });

            if (!response.text) {
                throw new Error("API가 텍스트 응답을 반환하지 않았습니다. (응답 없음)");
            }
            fullText = response.text; 

            const jsonStart = fullText.indexOf('---JSON_START---');
            const jsonEnd = fullText.indexOf('---JSON_END---');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("응답이 지정된 JSON 형식을 지키지 않았습니다.");
            }

            const jsonString = fullText.substring(jsonStart + '---JSON_START---'.length, jsonEnd).trim();
            const weatherJson = JSON.parse(jsonString);
            const analysisText = fullText.substring(jsonEnd + '---JSON_END---'.length).trim();
            
            const htmlAnalysis = markdownToHtml(analysisText); 

            setResult({
                city: weatherJson.city,
                temp: parseFloat(weatherJson.temp),
                humidity: parseFloat(weatherJson.humidity),
                pressure: parseFloat(weatherJson.pressure),
                description: weatherJson.description,
                analysis: htmlAnalysis, 
            });

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 API 오류';
            
            setError(`날씨 정보 및 분석에 실패했습니다. (오류: ${errorMessage})`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializeWeather = async () => {
            try {
                const city = await getLocationAndCity();
                setCityName(city);
                await fetchAndAnalyzeWeather(city);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
                setError(`위치 정보를 가져오는데 실패했습니다: ${errorMessage}`);
                setLoading(false);
            }
        };

        initializeWeather();
    }, [getLocationAndCity, fetchAndAnalyzeWeather]);

    const chartData = useMemo(() => {
        const data = result ? [result.temp, result.humidity, result.pressure] : [0, 0, 0];
        
        if (!result || data.every(val => val === 0)) return null; 

        return {
            labels: ['온도 (°C)', '습도 (%)', '기압 (hPa)'],
            datasets: [
                {
                    label: '오늘의 주요 날씨 요소 값',
                    data: data,
                    backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                    borderWidth: 1,
                },
            ],
        };
    }, [result]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `${cityName || '현재 위치'}의 현재 날씨 주요 수치` },
        },
        scales: {
            y: { beginAtZero: false }
        }
    };

    if (loading) return <div className="weather-analysis-container">**{cityName || '현재 위치'}**의 날씨를 확인하고 지구과학적으로 분석 중입니다...</div>;
    if (error) return <div className="weather-analysis-container" style={{color: 'red'}}>에러: {error}</div>;
    if (!result) return <div className="weather-analysis-container">날씨 데이터를 불러오지 못했습니다.</div>;

    return (
        <div className="weather-analysis-container">
            <h1>오늘의 날씨 지구과학적 분석 대시보드 ({result.city})</h1>
            
            <div>
                <h2>현재 날씨 요약</h2>
                <div>
                    <p>온도: {result.temp.toFixed(1)}°C</p>
                    <p>습도: {result.humidity}%</p>
                    <p>기압: {result.pressure} hPa</p>
                    <p>상태: {result.description}</p>
                </div>
            </div>

            <div>
                <h2>날씨 요소 시각화</h2>
                <div>
                    {chartData ? <Bar data={chartData} options={chartOptions} /> : <p>시각화할 유효한 데이터가 없습니다.</p>}
                </div>
            </div>

            <div className="prediction-box">
                <h2>지구과학적 분석 보고서</h2>
                <div dangerouslySetInnerHTML={{ __html: result.analysis }} />
            </div>
        </div>
    );
};

export default KnowWeather;