export type Category = '축제' | '공연' | '체험' | '전시' | '봉사활동' | '학교행사';

export interface EventItem {
  id: string;
  title: string;
  category: Category;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string;
  latitude: number; // For map simulation
  longitude: number; // For map simulation
  fee: string; // 참가비 (예: '무료', '10,000원')
  registration: string; // 신청 방법
  supplies: string; // 준비물
  description: string;
  isOutdoor: boolean; // 야외 행사 여부 (날씨 연동용)
  organizer: string; // 주최/주관
  phone: string; // 연락처
  imageUrl?: string; // 행사 이미지 (또는 플레이스홀더 아이콘)
}

export interface WeatherInfo {
  date: string;
  sky: '맑음' | '구름많음' | '흐림' | '비' | '소나기';
  temp: number;
  message: string;
}

export interface StampInfo {
  eventId: string;
  certifiedAt: string; // ISO String
}

export interface UserHistory {
  viewedEventIds: string[];
  favoriteEventIds: string[];
  interests: Category[];
}

export interface AIRecommendation {
  eventId: string;
  reason: string;
}
