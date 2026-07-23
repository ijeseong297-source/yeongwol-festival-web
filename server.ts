import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server
// Utilizes process.env.GEMINI_API_KEY injected automatically by the platform.
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI recommendations will be simulated with fallback logic.");
}

// 1. AI 행사 추천 API
// POST /api/recommend
app.post('/api/recommend', async (req, res) => {
  try {
    const { interests, favoriteEventIds, viewedEventIds, targetDate, allEvents } = req.body;

    if (!allEvents || !Array.isArray(allEvents) || allEvents.length === 0) {
      return res.status(400).json({ error: 'All events list is required' });
    }

    if (!ai) {
      // Fallback logic when Gemini key is missing
      console.log("No Gemini API key found, executing rule-based recommendation fallback.");
      const recommended = allEvents
        .filter(evt => {
          if (targetDate) {
            return evt.startDate <= targetDate && evt.endDate >= targetDate;
          }
          if (interests && Array.isArray(interests) && interests.length > 0) {
            return interests.includes(evt.category);
          }
          return true;
        })
        .slice(0, 3)
        .map(evt => ({
          eventId: evt.id,
          reason: `사용자님의 카테고리 선호도(${evt.category}) 및 일정에 딱 맞는 영월 대표 축제입니다. 꼭 참석하여 즐거운 시간 보내보세요!`
        }));
      return res.json({ recommendations: recommended });
    }

    // Prepare context for Gemini
    const eventContextString = allEvents.map(evt => {
      return `ID: ${evt.id}, 제목: ${evt.title}, 카테고리: ${evt.category}, 일정: ${evt.startDate} ~ ${evt.endDate}, 장소: ${evt.location}, 참가비: ${evt.fee}, 소개: ${evt.description}, 야외행사여부: ${evt.isOutdoor ? '야외' : '실내'}`;
    }).join('\n---\n');

    let prompt = `당신은 대한민국 강원특별자치도 영월군의 축제 및 문화 행사 안내 전문가입니다. 
아래의 영월 행사 목록 데이터를 참고하여, 사용자의 선호 정보 혹은 특정 입력 날짜에 최적화된 행사를 딱 2~3개 추천하고 친근하고 설득력 있는 개인화된 추천 이유를 한글로 작성해 주세요.

[영월 행사 목록]
${eventContextString}

[사용자 선호 정보 및 요청 사항]`;

    if (targetDate) {
      prompt += `\n- 원하는 날짜: ${targetDate} (이 날짜에 진행 중인 행사를 우선 추천해 주세요. 만약 당일 행사가 없다면 해당 날짜와 가장 가까운 행사를 제안하고 설명해 주세요.)`;
    }
    if (interests && Array.isArray(interests) && interests.length > 0) {
      prompt += `\n- 선호 카테고리 분야: ${interests.join(', ')}`;
    }
    if (favoriteEventIds && Array.isArray(favoriteEventIds) && favoriteEventIds.length > 0) {
      prompt += `\n- 관심 즐겨찾기 행사 ID 목록: ${favoriteEventIds.join(', ')}`;
    }
    if (viewedEventIds && Array.isArray(viewedEventIds) && viewedEventIds.length > 0) {
      prompt += `\n- 최근에 조회했던 관심 행사 ID 목록: ${viewedEventIds.join(', ')}`;
    }

    prompt += `\n\n결과는 반드시 아래 스키마를 만족하는 JSON 배열 형태로만 반환해야 합니다. 각 추천 행사 아이템의 eventId는 위 목록에 있는 실제 ID와 무조건 일치해야 합니다.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: '사용자 맞춤 추천 행사 리스트',
              items: {
                type: Type.OBJECT,
                properties: {
                  eventId: { type: Type.STRING, description: '목록에서 선택한 행사의 실제 id' },
                  reason: { type: Type.STRING, description: '사용자의 선호, 날씨, 날짜 등을 고려한 구체적이고 다정한 한국어 추천 사유 (존댓말 사용)' }
                },
                required: ['eventId', 'reason']
              }
            }
          },
          required: ['recommendations']
        }
      }
    });

    const responseText = response.text || '{"recommendations": []}';
    const resultJson = JSON.parse(responseText);
    return res.json(resultJson);

  } catch (error: any) {
    console.error('Error with Gemini recommendation:', error);
    return res.status(500).json({ error: error.message || 'AI recommendation failed' });
  }
});


// 2. 가상 영월 AI 축제 도우미 챗봇 API
// POST /api/chat-advisor
app.post('/api/chat-advisor', async (req, res) => {
  try {
    const { message, history, allEvents } = req.body;

    if (!ai) {
      return res.json({
        reply: "안녕하세요! 영월 축제 알림이입니다. 현재 인공지능 API 연결이 제한되어 기본 행사 정보를 기반으로 답변해 드립니다. 영월의 대표 축제로는 여름철 '동강뗏목축제'와 연중 열리는 '동강국제사진제'가 있습니다. 궁금하신 내용을 질문해 주시면 성심껏 돕겠습니다!"
      });
    }

    const eventContextString = (allEvents || []).map((evt: any) => {
      return `- ${evt.title} (${evt.category}): ${evt.startDate} ~ ${evt.endDate}, 장소: ${evt.location}, 참가비: ${evt.fee}, 소개: ${evt.description}`;
    }).join('\n');

    const systemInstruction = `당신은 강원특별자치도 영월군의 관광 문화 축제 공식 AI 해설사 '영이'입니다. 
당신의 임무는 영월에서 열리는 축제, 공연, 체험, 전시, 학교 행사 등에 관해 묻는 질문에 친절하고 정감 있는 한국어 존댓말로 답변하는 것입니다.

아래 영월 축제 데이터 정보를 정답의 유일한 기반이자 최우선 지식으로 삼으세요:
${eventContextString}

[답변 스타일 가이드]
1. 마치 영월군 문화관광과에서 근무하는 친절한 공무원 혹은 가이드처럼 다정하고 환영하는 톤으로 말해 주세요.
2. 방문객이 가져가야 할 준비물이나 꿀팁(예: 날씨 연동, 수분 보충, 천문대 갈 때 겉옷 준비 등)을 상황에 맞춰 재치 있게 곁들여 주세요.
3. 주어진 행사 데이터에 명시되어 있지 않은 행사나 가상의 날짜는 영월의 일반 관광 특산물(곤드레밥, 전병, 다하누촌 한우 등)과 아름다운 자연경관(한반도지형, 선돌, 청령포)을 연계하여 재미있게 제안해 주세요.
4. 이모티콘(예: 🌲, 🌊, 📸, 🌟)을 풍부하게 사용하여 가독성과 친근함을 높이세요.`;

    // Format chat history
    const geminiContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        geminiContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        });
      });
    }
    // Append current user message
    geminiContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: geminiContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ reply: response.text });

  } catch (error: any) {
    console.error('Error with Gemini chatbot:', error);
    return res.status(500).json({ error: error.message || 'AI Chatbot error' });
  }
});


// 3. Vite Dev Middleware / Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
