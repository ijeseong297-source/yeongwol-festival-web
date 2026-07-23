import { GoogleGenAI } from '@google/genai';
import { EventItem, Category } from '../types';
import { WEATHER_FORECAST } from '../data';

// 클라이언트 측 Direct Gemini 호출 또는 로컬 지능형 엔진 (GitHub Pages 정적 배포 대비)

export async function getClientAiRecommendations(
  interests: Category[],
  favorites: string[],
  viewedHistory: string[],
  selectedDate: string,
  allEvents: EventItem[]
): Promise<{ eventId: string; reason: string }[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 강원도 영월군 축제·행사 전문 맞춤형 AI 추천 시스템입니다.
다음 사용자 정보를 바탕으로 가장 알맞은 영월 행사 2개를 추천해주세요.

- 사용자 관심 분야: ${interests.join(', ') || '전체'}
- 선택 일자: ${selectedDate}
- 최근 조회한 행사 ID: ${viewedHistory.join(', ') || '없음'}
- 즐겨찾기 행사 ID: ${favorites.join(', ') || '없음'}

전체 행사 목록:
${JSON.stringify(allEvents.map(e => ({ id: e.id, title: e.title, category: e.category, startDate: e.startDate, endDate: e.endDate, description: e.description })), null, 2)}

반드시 다음 JSON 배열 형식으로만 정형화하여 응답해 주세요:
[
  { "eventId": "행사ID", "reason": "추천 이유 1~2문장 (친근한 어조)" }
]
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('Direct Gemini client recommendation failed, falling back to local engine:', err);
    }
  }

  // 로컬 추천 스마트 엔진
  const filtered = allEvents.filter(e => {
    const isCategoryMatch = interests.length === 0 || interests.includes(e.category);
    const isDateMatch = e.startDate <= selectedDate && e.endDate >= selectedDate;
    return isCategoryMatch || isDateMatch;
  });

  const candidates = filtered.length >= 2 ? filtered : allEvents;
  const top2 = candidates.slice(0, 2);

  return top2.map(e => ({
    eventId: e.id,
    reason: interests.includes(e.category)
      ? `'${e.category}' 분야를 선호하시는 방문객님께 딱 맞는 추천 행사입니다!`
      : `'${e.title}'은 영월 대표 일정으로 ${selectedDate} 기준 방문하기 정말 좋은 코스입니다.`
  }));
}

export async function getClientChatResponse(
  message: string,
  history: { role: string; content: string }[],
  allEvents: EventItem[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
당신은 강원도 영월군 축제·행사 안내 공식 AI 비서 '영이'입니다.
방문객에게 항상 다정하고 친절하며 전문적인 어조(한국어)로 안내하세요.
영월의 행사, 대표 축제(동강뗏목축제, 동강국제사진제, 별마로천문대 등), 날씨, 주차 및 교통 정보를 정확히 안내해 드립니다.

[참고 데이터 - 영월 행사 목록]
${JSON.stringify(allEvents.map(e => ({ title: e.title, category: e.category, date: `${e.startDate}~${e.endDate}`, location: e.location, fee: e.fee, desc: e.description, phone: e.phone })), null, 2)}
`;
      const contents = [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Direct Gemini client chat failed, falling back to local smart engine:', err);
    }
  }

  // 로컬 규칙 기반 스마트 챗봇 엔진 (GitHub Pages 정적 배포 시 백엔드 없이도 동작)
  const q = message.toLowerCase();

  // 특정 행사 검색
  const matchedEvents = allEvents.filter(e => 
    q.includes(e.title.toLowerCase()) || 
    q.includes(e.category.toLowerCase()) ||
    e.title.split(' ').some(word => word.length > 1 && q.includes(word.toLowerCase()))
  );

  if (q.includes('날씨') || q.includes('비') || q.includes('우산')) {
    const todayWeather = WEATHER_FORECAST['2026-07-13'];
    return `오늘(7월 13일) 영월의 날씨는 **${todayWeather.condition}**입니다! ☀️\n기온은 **${todayWeather.temp}°C**이며, 야외 행사나 동강 래프팅 시 햇볕 차단 모자나 텀블러를 챙기시면 더욱 좋습니다!`;
  }

  if (q.includes('뗏목') || q.includes('동강')) {
    const boat = allEvents.find(e => e.id === 'yw-boat-2026');
    if (boat) {
      return `🚣 **${boat.title}** 안내해 드릴게요!\n\n• **기간:** ${boat.startDate} ~ ${boat.endDate}\n• **장소:** ${boat.location}\n• **요금:** ${boat.fee}\n• **특징:** ${boat.description}\n\n문의처: ${boat.phone}`;
    }
  }

  if (q.includes('별마로') || q.includes('천문대') || q.includes('별자리') || q.includes('별')) {
    const star = allEvents.find(e => e.id === 'yw-star-2026');
    if (star) {
      return `🌌 **${star.title}** 정보입니다!\n\n• **장소:** ${star.location}\n• **요금:** ${star.fee}\n• **준비물:** ${star.supplies}\n• **안내:** 사전 예약제로 운영되며, 밤 봉래산 정상은 다소 서늘하니 겉옷을 챙기시면 좋아요!`;
    }
  }

  if (q.includes('사진') || q.includes('동강국제')) {
    const photo = allEvents.find(e => e.id === 'yw-photo-2026');
    if (photo) {
      return `📷 **${photo.title}** 안내입니다!\n\n• **일시:** ${photo.startDate} ~ ${photo.endDate}\n• **장소:** ${photo.location}\n• **입장료:** ${photo.fee}\n• **설명:** ${photo.description}`;
    }
  }

  if (q.includes('주차') || q.includes('차량') || q.includes('길찾기') || q.includes('네비')) {
    return `🚗 **영월 행사 주차 및 접근성 안내**\n\n• **동강둔치:** 둔치 내 넓은 무료 주차장 보유\n• **동강사진박물관:** 전용 주차장 및 영월군청 주차장 이용 가능\n• **별마로천문대:** 정상 주차장 완비 (진입로 구불구불하므로 안전운전 필수!)\n\n어플 내 지도 탭을 클릭하시면 카카오맵/네이버지도 연동 길찾기도 바로 지원됩니다!`;
  }

  if (matchedEvents.length > 0) {
    const target = matchedEvents[0];
    return `🌲 질문하신 내용과 연관된 **'${target.title}'** 행사 정보입니다:\n\n• **카테고리:** ${target.category}\n• **일정:** ${target.startDate} ~ ${target.endDate}\n• **장소:** ${target.location}\n• **참가비:** ${target.fee}\n• **내용:** ${target.description}\n\n추가로 궁금하신 점이 있다면 언제든 말씀해 주세요!`;
  }

  return `안녕하세요! 영월 축제·행사 비서 **영이**입니다. 🌲\n\n현재 영월에서는 **동강뗏목축제**, **동강국제사진제**, **별마로천문대 별자리 체험**, **동강 생태체험 교실** 등 다채로운 행사가 진행되고 있습니다.\n\n궁금하신 행사의 이름이나 '날씨', '주차', '추천' 등을 자유롭게 물어보세요!`;
}
