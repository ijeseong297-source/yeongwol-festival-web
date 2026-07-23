import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Navigation, 
  Award, 
  Bell, 
  Star, 
  CloudRain, 
  Cloud, 
  Sun, 
  User, 
  Plus, 
  MessageSquare, 
  X, 
  Check, 
  Compass, 
  Phone, 
  Info, 
  Map, 
  Send,
  AlertTriangle,
  QrCode,
  CheckCircle,
  Clock
} from 'lucide-react';
import { INITIAL_EVENTS, WEATHER_FORECAST, DEFAULT_WEATHER } from './data';
import { EventItem, Category, WeatherInfo, StampInfo } from './types';
import MapSimulator from './components/MapSimulator';
import { getClientAiRecommendations, getClientChatResponse } from './utils/aiClientFallback';

export default function App() {
  // 상태 관리
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(INITIAL_EVENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | '전체'>('전체');
  
  // 날짜 선택 (달력 제어) - 기본값 2026-07-13 (시뮬레이션 기준일)
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-13');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 7월 고정 및 네비게이션 시뮬레이션

  // 사용자 선호 및 로컬 스토리지 데이터
  const [interests, setInterests] = useState<Category[]>(['축제', '체험']);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]); // 알림 신청한 행사 ID 목록
  const [viewedHistory, setViewedHistory] = useState<string[]>([]);
  const [stamps, setStamps] = useState<StampInfo[]>([]);

  // 신규 행사 등록 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<EventItem, 'id'>>({
    title: '',
    category: '학교행사',
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    location: '',
    latitude: 37.185,
    longitude: 128.465,
    fee: '무료',
    registration: '선착순 접수',
    supplies: '없음',
    description: '',
    isOutdoor: true,
    organizer: '영월 학생 연합회',
    phone: '033-370-1234'
  });

  // AI 추천 상태
  const [aiRecommendations, setAiRecommendations] = useState<{ eventId: string; reason: string }[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendError, setRecommendError] = useState('');

  // AI 챗봇 상태
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '안녕하세요! 영월 축제·행사 공식 AI 비서 **영이**입니다. 🌲\n\n무더운 여름, 시원한 동강뗏목축제나 낭만적인 별마로천문대 별자리 여행에 대해 무엇이든 편하게 물어보세요! 날씨 안내와 길찾기도 도와드릴 수 있어요!' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 스탬프 인증 모달
  const [showStampModal, setShowStampModal] = useState(false);
  const [stampSuccess, setStampSuccess] = useState(false);

  // 로컬 스토리지 연동
  useEffect(() => {
    const savedFavorites = localStorage.getItem('yw_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedNotifications = localStorage.getItem('yw_notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedStamps = localStorage.getItem('yw_stamps');
    if (savedStamps) setStamps(JSON.parse(savedStamps));

    const savedInterests = localStorage.getItem('yw_interests');
    if (savedInterests) setInterests(JSON.parse(savedInterests));

    const savedEvents = localStorage.getItem('yw_custom_events');
    if (savedEvents) {
      setEvents([...INITIAL_EVENTS, ...JSON.parse(savedEvents)]);
    }
  }, []);

  // 조회 기록 및 AI 추천 업데이트 트리거
  useEffect(() => {
    if (selectedEvent) {
      setViewedHistory(prev => {
        const next = [selectedEvent.id, ...prev.filter(id => id !== selectedEvent.id)].slice(0, 5);
        return next;
      });
    }
  }, [selectedEvent]);

  // AI 맞춤 추천 가져오기 함수
  const fetchAiRecommendations = async () => {
    setIsRecommending(true);
    setRecommendError('');
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests,
          favoriteEventIds: favorites,
          viewedEventIds: viewedHistory,
          targetDate: selectedDate,
          allEvents: events
        })
      });
      if (!response.ok) throw new Error('백엔드 API 미연결 (정적 환경)');
      const data = await response.json();
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    } catch (err: any) {
      // GitHub Pages 등 정적 서버 환경에서는 클라이언트 AI 엔진 활용
      const clientRecs = await getClientAiRecommendations(
        interests,
        favorites,
        viewedHistory,
        selectedDate,
        events
      );
      setAiRecommendations(clientRecs);
    } finally {
      setIsRecommending(false);
    }
  };

  // 관심사나 선택 날짜가 바뀌면 AI 추천 자동 갱신
  useEffect(() => {
    fetchAiRecommendations();
  }, [interests, selectedDate, events.length]);

  // 즐겨찾기 토글
  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('yw_favorites', JSON.stringify(next));
  };

  // 알림 토글
  const toggleNotification = (id: string) => {
    const next = notifications.includes(id) ? notifications.filter(item => item !== id) : [...notifications, id];
    setNotifications(next);
    localStorage.setItem('yw_notifications', JSON.stringify(next));
  };

  // 신규 행사 등록 처리
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `custom-${Date.now()}`;
    const item: EventItem = {
      id: newId,
      ...newEvent
    };

    const updatedEvents = [...events, item];
    setEvents(updatedEvents);
    setSelectedEvent(item);

    // 사용자 커스텀 이벤트 저장
    const customEvents = updatedEvents.filter(evt => evt.id.startsWith('custom-'));
    localStorage.setItem('yw_custom_events', JSON.stringify(customEvents));

    setShowAddModal(false);
    // 폼 초기화
    setNewEvent({
      title: '',
      category: '학교행사',
      startDate: '2026-07-15',
      endDate: '2026-07-15',
      location: '',
      latitude: 37.185,
      longitude: 128.465,
      fee: '무료',
      registration: '선착순 접수',
      supplies: '없음',
      description: '',
      isOutdoor: true,
      organizer: '영월 학생 연합회',
      phone: '033-370-1234'
    });
  };

  // 관심 카테고리 체크박스 토글
  const toggleInterest = (category: Category) => {
    const next = interests.includes(category) 
      ? interests.filter(c => c !== category) 
      : [...interests, category];
    setInterests(next);
    localStorage.setItem('yw_interests', JSON.stringify(next));
  };

  // AI 챗봇 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.slice(-8).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          })),
          allEvents: events
        })
      });

      if (!response.ok) throw new Error('백엔드 API 미연결 (정적 환경)');
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      // GitHub Pages 등 정적 서버 환경에서는 클라이언트 지능형 응답 엔진 활용
      const reply = await getClientChatResponse(userMsg, chatMessages, events);
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 스탬프 스캔 인증 완료 처리
  const handleStampCertification = () => {
    if (stamps.some(s => s.eventId === selectedEvent.id)) {
      alert('이미 스탬프가 인증된 행사입니다!');
      setShowStampModal(false);
      return;
    }

    setStampSuccess(true);
    setTimeout(() => {
      const newStamp: StampInfo = {
        eventId: selectedEvent.id,
        certifiedAt: new Date().toISOString()
      };
      const nextStamps = [...stamps, newStamp];
      setStamps(nextStamps);
      localStorage.setItem('yw_stamps', JSON.stringify(nextStamps));
      setStampSuccess(false);
      setShowStampModal(false);
    }, 1800);
  };

  // 날씨 정보 추출 (선택된 날짜 기준)
  const getWeatherForDate = (dateStr: string): WeatherInfo => {
    const found = WEATHER_FORECAST.find(w => w.date === dateStr);
    return found || { ...DEFAULT_WEATHER, date: dateStr };
  };

  const selectedDateWeather = getWeatherForDate(selectedDate);

  // 이벤트 필터링 로직
  // 1. 카테고리 필터
  // 2. 검색어 매칭 (행사명, 장소, 설명)
  // 3. 달력에서 선택된 날짜에 열려 있는 행사 필터링 가능
  const filteredEvents = events.filter(evt => {
    const matchCategory = selectedCategory === '전체' || evt.category === selectedCategory;
    const matchSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 특정 날짜가 선택되어 있으면, 해당 날짜가 행사 기간 내에 속하는지 여부
    const matchDate = selectedDate ? (evt.startDate <= selectedDate && evt.endDate >= selectedDate) : true;

    return matchCategory && matchSearch && matchDate;
  });

  // 오늘 열리는 행사 (기준일: 2026-07-13)
  const todayEvents = events.filter(evt => {
    return evt.startDate <= '2026-07-13' && evt.endDate >= '2026-07-13';
  });

  // 이번 주 예정된 행사 (2026-07-13 ~ 2026-07-20 사이 시작되거나 진행 중인 행사)
  const thisWeekEvents = events.filter(evt => {
    return (evt.startDate >= '2026-07-13' && evt.startDate <= '2026-07-20') ||
           (evt.startDate <= '2026-07-13' && evt.endDate >= '2026-07-13');
  });

  // 2026년 7월 달력 날짜 목록 구성 (1일 수요일 ~ 31일 금요일)
  // 이전 달 채우기 (6월 28, 29, 30) - 회색 표시용
  const prevMonthDays = [28, 29, 30];
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthDays = [1, 2, 3]; // 다음 달 앞부분

  const handleDateClick = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    setSelectedDate(`2026-07-${formattedDay}`);
  };

  return (
    <div className="bg-[#F5F5F0] text-[#2D2D2A] min-h-screen flex flex-col font-sans antialiased selection:bg-[#4A6741] selection:text-white" id="main-app-container">
      
      {/* 1. 상단 헤더 내비게이션 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E0E0D5] px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs" id="app-header">
        <div className="flex items-center gap-4">
          <div className="bg-[#4A6741] text-white p-2.5 rounded-2xl shadow-sm flex items-center justify-center">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#4A6741] tracking-tight flex items-center gap-1.5 italic">
              영월 축제·행사 온가이드
            </h1>
            <p className="text-[10px] md:text-xs text-[#7A7A70] font-medium font-mono">Yeongwol Event & Festival AI Guide</p>
          </div>
        </div>

        {/* 대시보드 요약: 오늘 날씨 및 스탬프 적립 현황 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 날씨 요약 */}
          <div className="bg-[#FDFBF7] px-4 py-2 rounded-2xl border border-[#E0E0D5] flex items-center gap-2 shadow-2xs">
            <span className="text-[10px] font-bold text-[#7A7A70] tracking-wider uppercase">오늘의 영월</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span className="text-sm">☁️ 구름많음</span>
              <span className="font-mono text-emerald-700 font-bold">28°C</span>
            </div>
          </div>

          {/* 스탬프 개수 */}
          <div className="bg-[#5A5A40] text-white px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-medium">내 스탬프 <strong className="font-mono text-amber-200 text-sm">{stamps.length}</strong>/3 개</span>
          </div>

          {/* 행사 직접 등록하기 버튼 */}
          <button
            id="add-event-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="bg-[#4A6741] hover:bg-[#3d5535] text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            학교/행사 등록
          </button>
        </div>
      </header>

      {/* 실시간 중요 알림 배너 */}
      <div className="bg-[#2D2D2A] text-white py-2 px-4 md:px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/10" id="announcement-banner">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse">중요 공지</span>
          <p className="opacity-90 truncate max-w-xl">
            [우천 예보] 7월 14일 영월 전역 우천 예보에 따라 야외에서 개최 예정인 일부 행사 일정이 변경될 수 있습니다. 꼭 우측 날씨 가이드를 확인하세요!
          </p>
        </div>
        <div className="text-[10px] text-amber-200/80 font-mono flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" /> 실시간 동기화 완료: 2026-07-13
        </div>
      </div>

      {/* 2. 메인 컨텐츠 레이아웃 */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6" id="main-content">
        
        {/* [왼쪽 영역] 달력 & 카테고리 필터 (lg:col-span-3) */}
        <aside className="lg:col-span-3 flex flex-col gap-6" id="left-sidebar">
          
          {/* 달력 위젯 */}
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-[#E0E0D5] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#7A7A70] font-bold uppercase tracking-wider">상세 일정 선택</span>
                <h2 className="font-serif font-bold text-lg text-slate-900">{currentYear}년 {currentMonth}월</h2>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => alert('현재 2026년 7월 영월 축제 집중 탐색 기간입니다.')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-[#4A6741] font-bold text-sm"
                  title="이전 달"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => alert('현재 2026년 7월 영월 축제 집중 탐색 기간입니다.')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-[#4A6741] font-bold text-sm"
                  title="다음 달"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* 달력 요일 표시 */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 font-bold text-[#7A7A70] border-b border-slate-100 pb-1">
              <span className="text-red-500">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span className="text-blue-500">토</span>
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs" id="calendar-grid">
              {/* 6월 이전 일자 */}
              {prevMonthDays.map((day) => (
                <span key={`prev-${day}`} className="py-2 text-[#7A7A70]/30 font-mono">{day}</span>
              ))}

              {/* 7월 본 일자 */}
              {currentMonthDays.map((day) => {
                const formattedDay = day < 10 ? `0${day}` : `${day}`;
                const dateString = `2026-07-${formattedDay}`;
                const isSelected = selectedDate === dateString;
                
                // 해당 날짜에 열리는 축제 개수 구하기
                const dayEventCount = events.filter(e => e.startDate <= dateString && e.endDate >= dateString).length;

                // 오늘 날짜 표시 (7월 13일)
                const isToday = day === 13;

                // 일요일/토요일 색상 설정
                const dayOfWeek = (day + 2) % 7; // 7월 1일이 수요일(3)이므로 계산 보정
                let textClass = "text-slate-800";
                if (dayOfWeek === 0) textClass = "text-red-500";
                if (dayOfWeek === 6) textClass = "text-blue-500";

                return (
                  <button
                    key={`day-${day}`}
                    id={`calendar-day-${day}`}
                    onClick={() => handleDateClick(day)}
                    className={`relative py-2 rounded-xl transition-all flex flex-col items-center justify-center font-mono ${
                      isSelected 
                        ? 'bg-[#4A6741] text-white font-bold shadow-md transform scale-105' 
                        : isToday
                        ? 'bg-amber-100 border border-amber-400 font-bold'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className={`${isSelected ? 'text-white' : textClass} text-xs`}>{day}</span>
                    
                    {/* 행사 유무 도트 표시 */}
                    {dayEventCount > 0 && (
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-[#4A6741]'}`}></span>
                    )}
                  </button>
                );
              })}

              {/* 8월 다음 일자 */}
              {nextMonthDays.map((day) => (
                <span key={`next-${day}`} className="py-2 text-[#7A7A70]/30 font-mono">{day}</span>
              ))}
            </div>

            {/* 선택일 요약 및 전체 초기화 */}
            <div className="mt-4 pt-3 border-t border-[#E0E0D5] flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[#7A7A70] text-[10px]">선택된 날짜</span>
                <span className="font-bold text-slate-800 font-mono">{selectedDate}</span>
              </div>
              <button 
                id="reset-date-btn"
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-[#4A6741] hover:underline font-semibold"
              >
                모든 날짜 보기
              </button>
            </div>
          </div>

          {/* 분야별 검색 카테고리 태그 모음 */}
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-[#E0E0D5]">
            <h3 className="text-xs font-bold text-[#7A7A70] uppercase tracking-wider mb-3">행사 분야 선택</h3>
            <div className="flex flex-col gap-2">
              {(['전체', '축제', '공연', '체험', '전시', '봉사활동', '학교행사'] as const).map((category) => {
                const count = category === '전체' 
                  ? events.length 
                  : events.filter(e => e.category === category).length;

                return (
                  <button
                    key={category}
                    id={`category-filter-${category}`}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#4A6741] text-white shadow-xs font-semibold'
                        : 'bg-[#FDFBF7] hover:bg-[#F5F5F0] text-slate-700 border border-[#E0E0D5]'
                    }`}
                  >
                    <span>
                      {category === '전체' && '🌍 전체 일정'}
                      {category === '축제' && '🏮 문화 축제'}
                      {category === '공연' && '🎵 무대 공연'}
                      {category === '체험' && '🌿 체험 교실'}
                      {category === '전시' && '📸 미술/전시'}
                      {category === '봉사활동' && '🤝 자원봉사'}
                      {category === '학교행사' && '🏫 학교 행사'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedCategory === category ? 'bg-white/20 text-white' : 'bg-[#EAEAE0] text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 스탬프 투어 및 리워드 배너 */}
          <div className="bg-[#5A5A40] rounded-[32px] p-5 text-white shadow-lg flex flex-col justify-between relative overflow-hidden" id="stamp-badge-card">
            {/* 배경 무늬 장식 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-400 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">STAMP TOUR</span>
                <span className="text-xs text-amber-200">영월 문화 투어</span>
              </div>
              <h3 className="text-lg font-serif font-bold mb-1 leading-tight">스마트 스탬프 인증</h3>
              <p className="text-xs text-slate-200/90 leading-relaxed mb-4">
                축제 및 행사장에 비치된 QR코드를 찾아 적립하세요. 3개 이상 모으면 영월 특산물 교환권을 드립니다!
              </p>
            </div>

            {/* 스탬프 현황판 */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-black/15 p-3 rounded-2xl border border-white/5 text-center">
              {[0, 1, 2].map((idx) => {
                const isCertified = stamps.length > idx;
                return (
                  <div key={`stamp-slot-${idx}`} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCertified ? 'bg-amber-400 border-amber-200 text-slate-900' : 'bg-white/10 border-white/20 text-white/40'
                    } shadow-inner transition-all`}>
                      {isCertified ? <CheckCircle className="w-5 h-5 font-bold" /> : <QrCode className="w-5 h-5 opacity-60" />}
                    </div>
                    <span className="text-[9px] mt-1 text-slate-300 font-mono">스탬프 {idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {stamps.length >= 3 ? (
              <div className="bg-amber-400 text-slate-900 p-2.5 rounded-xl text-center text-xs font-bold shadow-md">
                🎉 축하합니다! 상품 획득 대상자입니다.
              </div>
            ) : (
              <p className="text-[10px] text-center text-amber-200/80">
                원하는 행사 방문 후 상세 화면에서 QR코드를 스캔하세요.
              </p>
            )}
          </div>

        </aside>

        {/* [중앙 영역] 오늘/이번주 주요 축제 및 행사 목록 (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="center-main-panel">
          
          {/* 검색 바 */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-[#E0E0D5] flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder="축제명, 장소, 준비물 등을 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0] border border-[#E0E0D5] rounded-2xl text-xs font-medium focus:outline-none focus:border-[#4A6741] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {selectedCategory !== '전체' || searchQuery || selectedDate ? (
              <button
                id="clear-all-filters-btn"
                onClick={() => {
                  setSelectedCategory('전체');
                  setSearchQuery('');
                  setSelectedDate('2026-07-13'); // 기본 시뮬레이션일로 원복
                }}
                className="bg-[#EAEAE0] text-[#2D2D2A] text-xs font-semibold px-4 py-2.5 rounded-2xl hover:bg-[#D6D6C8] transition-all"
              >
                필터 해제
              </button>
            ) : null}
          </div>

          {/* D-DAY 하이라이트 배너 (오늘의 대표 축제) */}
          <div className="relative bg-[#D6D6C8] rounded-[40px] h-[260px] overflow-hidden group shadow-sm flex flex-col justify-end" id="highlight-hero-banner">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80" 
              alt="동강뗏목축제"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
            
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-[10px] font-bold border border-white/20">
              ⚡ 여름축제 집중 개최
            </div>

            <div className="p-6 md:p-8 z-10 text-white">
              <span className="px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-[10px] font-bold mb-2 inline-block shadow-sm">
                영월 여름 시그니처
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2 leading-tight">
                2026 영월 동강뗏목축제
              </h2>
              <p className="opacity-90 text-xs max-w-sm leading-relaxed mb-3">
                전통 뗏목 시연부터 시원한 물놀이, 버스킹과 맛있는 푸드트럭 야시장까지 가득한 한여름 수중 레이스!
              </p>
              <button 
                id="view-hero-detail-btn"
                onClick={() => {
                  const target = events.find(e => e.id === 'yw-boat-2026');
                  if (target) setSelectedEvent(target);
                }}
                className="text-xs bg-white text-slate-800 hover:bg-[#F5F5F0] font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1 w-fit"
              >
                상세 일정 및 꿀팁 확인
              </button>
            </div>
          </div>

          {/* 주요 일정 요약: 오늘 열리는 행사 & 이번 주 예정 행사 */}
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-[#E0E0D5]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                오늘 열리는 행사 <span className="font-mono text-xs text-slate-400">({todayEvents.length})</span>
              </h3>
              <span className="text-[10px] font-semibold text-[#7A7A70] font-mono">기준일: 2026-07-13</span>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">오늘 예정된 행사가 없습니다. 일정을 직접 추가해 보세요!</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((evt) => (
                  <div 
                    key={`today-${evt.id}`}
                    id={`today-item-${evt.id}`}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedEvent.id === evt.id 
                        ? 'bg-[#FDFBF7] border-[#4A6741] shadow-2xs' 
                        : 'bg-[#FDFBF7]/40 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAEAE0] flex-shrink-0 flex items-center justify-center text-sm">
                        {evt.category === '축제' && '🏮'}
                        {evt.category === '공연' && '🎵'}
                        {evt.category === '체험' && '🌿'}
                        {evt.category === '전시' && '📸'}
                        {evt.category === '봉사활동' && '🤝'}
                        {evt.category === '학교행사' && '🏫'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{evt.title}</h4>
                        <p className="text-[10px] text-[#7A7A70] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {evt.location.split('(')[0]}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#EAEAE0] text-[#2D2D2A] px-2 py-0.5 rounded-md font-mono shrink-0">
                      진행중
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 목록 및 검색 결과 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  {selectedDate ? `${selectedDate} 예정 행사` : '영월 문화·체험 일정 목록'}
                </h3>
                <p className="text-[11px] text-[#7A7A70]">조건에 맞는 행사 {filteredEvents.length}건이 검색되었습니다.</p>
              </div>
              
              <div className="flex gap-2">
                <span className="text-xs text-slate-400">정렬 기준 : 행사 일순</span>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 text-center border border-[#E0E0D5] flex flex-col items-center justify-center">
                <Info className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">검색 조건에 부합하는 일정이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">카테고리를 변경하거나 다른 날짜를 선택해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="event-list-grid">
                {filteredEvents.map((evt) => {
                  const isFav = favorites.includes(evt.id);
                  const isNotified = notifications.includes(evt.id);

                  return (
                    <div
                      key={evt.id}
                      id={`event-card-${evt.id}`}
                      onClick={() => setSelectedEvent(evt)}
                      className={`bg-white p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-xs group ${
                        selectedEvent.id === evt.id
                          ? 'border-[#4A6741] ring-1 ring-[#4A6741] shadow-2xs'
                          : 'border-[#E0E0D5]'
                      }`}
                    >
                      <div>
                        {/* 이미지 또는 대표 아이콘 */}
                        <div className="h-28 w-full rounded-2xl bg-[#EAEAE0] overflow-hidden mb-3 relative">
                          {evt.imageUrl ? (
                            <img 
                              src={evt.imageUrl} 
                              alt={evt.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {evt.category === '학교행사' ? '🏫' : '🌿'}
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                            {evt.category}
                          </span>
                          
                          {/* 즐겨찾기 별 */}
                          <button
                            id={`fav-btn-${evt.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(evt.id);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                              isFav ? 'bg-amber-100 text-amber-500' : 'bg-black/40 text-white/80 hover:bg-black/60'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#4A6741] transition-colors">
                          {evt.title}
                        </h4>
                        
                        <p className="text-[10px] text-[#7A7A70] mt-1 font-mono">
                          📅 {evt.startDate} ~ {evt.endDate}
                        </p>
                        
                        <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {evt.location.split('(')[0]}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#4A6741] bg-[#4A6741]/10 px-2 py-0.5 rounded-md">
                          참가비: {evt.fee}
                        </span>
                        
                        <div className="flex gap-1">
                          {isNotified && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                              알림대기
                            </span>
                          )}
                          <span className="text-[10px] font-bold border-b border-[#4A6741] text-[#4A6741]">
                            상세정보 ➔
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI 추천 맞춤 행사 및 날짜 추천 리스트 */}
          <div className="bg-[#FDFBF7] rounded-[32px] p-5 shadow-sm border border-[#E0E0D5] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#4A6741] rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  AI 스마트 맞춤형 추천 
                </h3>
              </div>
              <button
                id="refresh-ai-btn"
                onClick={fetchAiRecommendations}
                className="text-[10px] bg-[#EAEAE0] hover:bg-[#D6D6C8] text-slate-700 px-2.5 py-1 rounded-full font-bold transition-all"
                disabled={isRecommending}
              >
                {isRecommending ? '생성 중...' : '맞춤 새로고침'}
              </button>
            </div>

            {/* 관심사 설정 */}
            <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-2xl border border-slate-150">
              <span className="text-[10px] font-bold text-[#7A7A70] uppercase tracking-wider">내가 설정한 관심 분야</span>
              <div className="flex flex-wrap gap-1.5">
                {(['축제', '공연', '체험', '전시', '봉사활동', '학교행사'] as Category[]).map((cat) => {
                  const active = interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      id={`interest-tag-${cat}`}
                      onClick={() => toggleInterest(cat)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        active 
                          ? 'bg-[#4A6741]/10 text-[#4A6741] border-[#4A6741] font-bold' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : ''}{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {isRecommending ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-6 h-6 border-2 border-[#4A6741] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 mt-2">사용자 맞춤 관심 정보 및 날씨 기반 추천을 연산하고 있습니다...</p>
              </div>
            ) : recommendError ? (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">{recommendError}</p>
            ) : aiRecommendations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">추천된 맞춤 행사가 아직 없습니다. 다른 카테고리를 선택해 보세요.</p>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec) => {
                  const targetEvt = events.find(e => e.id === rec.eventId);
                  if (!targetEvt) return null;

                  return (
                    <div 
                      key={`rec-${rec.eventId}`}
                      id={`ai-rec-card-${rec.eventId}`}
                      onClick={() => setSelectedEvent(targetEvt)}
                      className="bg-white p-3.5 rounded-2xl border border-[#E0E0D5] hover:border-[#4A6741] transition-all cursor-pointer flex gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">AI 추천행사</span>
                          <span className="text-[9px] font-semibold text-slate-400">{targetEvt.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{targetEvt.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed italic">
                          "{rec.reason}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </section>

        {/* [오른쪽 영역] 행사 상세 보기 & 지도 시뮬레이터 (lg:col-span-4) */}
        <aside className="lg:col-span-4 flex flex-col gap-6" id="right-sidebar">
          
          {/* 행사 상세 정보 */}
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-[#E0E0D5] flex flex-col gap-4" id="detail-panel">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs bg-[#EAEAE0] text-[#2D2D2A] px-2.5 py-1 rounded-full font-bold">
                상세 일정 정보
              </span>
              <div className="flex gap-2">
                {/* 즐겨찾기 버튼 */}
                <button
                  id="detail-fav-toggle-btn"
                  onClick={() => toggleFavorite(selectedEvent.id)}
                  className={`p-2 rounded-2xl border transition-all ${
                    favorites.includes(selectedEvent.id)
                      ? 'bg-amber-100 border-amber-300 text-amber-500'
                      : 'bg-[#FDFBF7] border-[#E0E0D5] hover:bg-[#F5F5F0] text-slate-400'
                  }`}
                  title="즐겨찾기 저장"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                {/* 알림 신청 버튼 */}
                <button
                  id="detail-bell-toggle-btn"
                  onClick={() => toggleNotification(selectedEvent.id)}
                  className={`p-2 rounded-2xl border transition-all ${
                    notifications.includes(selectedEvent.id)
                      ? 'bg-[#4A6741] border-[#4A6741] text-white'
                      : 'bg-[#FDFBF7] border-[#E0E0D5] hover:bg-[#F5F5F0] text-[#7A7A70]'
                  }`}
                  title="행사 시작 전 알림 예약"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 행사 핵심 기본 요약 */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#4A6741] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  {selectedEvent.category}
                </span>
                {notifications.includes(selectedEvent.id) && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Bell className="w-3 h-3" /> 알림 예약 완료
                  </span>
                )}
              </div>
              
              <h2 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-snug">
                {selectedEvent.title}
              </h2>
              
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            {/* 이미지 */}
            {selectedEvent.imageUrl && (
              <div className="h-40 w-full rounded-2xl overflow-hidden border border-slate-150">
                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* 날씨 어드바이저 연동 */}
            <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0E0D5]">
              <h4 className="text-xs font-bold text-[#7A7A70] flex items-center gap-1.5 mb-1.5">
                <Cloud className="w-4 h-4 text-emerald-700" />
                선택 일자 영월 날씨 & 가이드
              </h4>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {selectedDateWeather.sky === '맑음' && '☀️'}
                    {selectedDateWeather.sky === '구름많음' && '☁️'}
                    {selectedDateWeather.sky === '흐림' && '⛅'}
                    {selectedDateWeather.sky === '비' && '☔'}
                    {selectedDateWeather.sky === '소나기' && '🌦️'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 font-mono">2026-07-13 예보</p>
                    <p className="text-[10px] text-slate-500 font-medium">상태: {selectedDateWeather.sky} ({selectedDateWeather.temp}°C)</p>
                  </div>
                </div>
                {selectedEvent.isOutdoor && (selectedDateWeather.sky === '비' || selectedDateWeather.sky === '소나기') ? (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 animate-bounce" /> 우천대비
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-[#4A6741] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    야외무난
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {selectedDateWeather.message}
              </p>
            </div>

            {/* 상세 명세 정보 리스트 */}
            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">📅 개최 기간</span>
                <span className="text-slate-800 font-mono font-bold">{selectedEvent.startDate} ~ {selectedEvent.endDate}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">📍 장소</span>
                <span className="text-slate-800 text-right">{selectedEvent.location}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">💵 참가비</span>
                <span className="text-slate-800 font-semibold">{selectedEvent.fee}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">📝 신청방법</span>
                <span className="text-slate-800 text-right">{selectedEvent.registration}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">🎒 준비물</span>
                <span className="text-slate-800">{selectedEvent.supplies}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">🏢 주최/주관</span>
                <span className="text-slate-800">{selectedEvent.organizer}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-semibold text-slate-500">📞 연락처</span>
                <span className="text-[#4A6741] font-mono font-bold">{selectedEvent.phone}</span>
              </div>
            </div>

            {/* 현장 가상 QR 인증 스탬프 획득 섹션 */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-150">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800">현장 스탬프 적립</span>
                </div>
                {stamps.some(s => s.eventId === selectedEvent.id) ? (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ 적립완료
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold">적립 가능</span>
                )}
              </div>
              <button
                id="open-stamp-scanner-btn"
                onClick={() => {
                  if (stamps.some(s => s.eventId === selectedEvent.id)) {
                    alert('이미 적립한 행사입니다!');
                    return;
                  }
                  setShowStampModal(true);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                  stamps.some(s => s.eventId === selectedEvent.id)
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                    : 'bg-[#4A6741] hover:bg-[#3d5535] text-white active:scale-95'
                }`}
              >
                <QrCode className="w-4 h-4" />
                가상 QR코드 스캔 및 인증하기
              </button>
            </div>

            {/* 지도 시뮬레이터 연동 */}
            <MapSimulator event={selectedEvent} />
          </div>

        </aside>

      </main>

      {/* 3. 하단 스마트 어시스턴트 플로팅 챗봇 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="floating-chatbot-container">
        
        {/* 대화 창 */}
        {showChatbot && (
          <div className="w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-[#E0E0D5] overflow-hidden flex flex-col h-[480px] animate-fade-in" id="ai-chat-window">
            
            {/* 챗봇 헤더 */}
            <div className="bg-[#4A6741] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  🌲
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm">영월 AI 도우미 '영이'</h4>
                  <p className="text-[9px] text-emerald-200">실시간 축제 DB 연동 중</p>
                </div>
              </div>
              <button 
                id="close-chat-btn"
                onClick={() => setShowChatbot(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 메시지 이력 영역 */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FDFBF7]" id="chat-messages-box">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={`msg-${idx}`} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-[#4A6741] text-white rounded-br-2xs' 
                      : 'bg-white text-slate-800 border border-[#E0E0D5] rounded-bl-2xs shadow-3xs'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl border border-[#E0E0D5] shadow-3xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* 메시지 입력 폼 */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E0E0D5] flex gap-2">
              <input
                id="chat-input-field"
                type="text"
                placeholder="동강뗏목축제 준비물은 뭐야?..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#F5F5F0] border border-[#E0E0D5] rounded-xl text-xs focus:outline-none focus:border-[#4A6741] transition-all font-medium"
              />
              <button 
                id="chat-send-btn"
                type="submit" 
                className="bg-[#4A6741] hover:bg-[#3d5535] text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 챗봇 트리거 플로팅 버블 */}
        <button
          id="toggle-chatbot-bubble"
          onClick={() => setShowChatbot(!showChatbot)}
          className="bg-[#4A6741] hover:bg-[#3d5535] text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-bold text-sm"
        >
          <MessageSquare className="w-5 h-5" />
          <span>영월 AI 챗봇</span>
          <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
        </button>
      </div>

      {/* 4. 행사 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[#E0E0D5] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in" id="add-event-modal">
            <div className="bg-[#4A6741] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base">새로운 학교 및 지역 행사 등록</h3>
              </div>
              <button 
                id="close-add-modal-btn"
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">행사 분야 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['학교행사', '축제', '공연', '체험', '전시', '봉사활동'] as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      id={`modal-category-${cat}`}
                      onClick={() => setNewEvent({ ...newEvent, category: cat })}
                      className={`text-xs py-2 rounded-xl border font-semibold transition-all ${
                        newEvent.category === cat
                          ? 'bg-[#4A6741] text-white border-[#4A6741]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">행사명</label>
                <input
                  id="add-event-title"
                  type="text"
                  required
                  placeholder="예: 영월여고 연합 댄스 동아리 축제"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#4A6741]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">시작일</label>
                  <input
                    id="add-event-start-date"
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">종료일</label>
                  <input
                    id="add-event-end-date"
                    type="date"
                    required
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">장소</label>
                <input
                  id="add-event-location"
                  type="text"
                  required
                  placeholder="예: 영월여고 목련관 대강당"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">참가비</label>
                  <input
                    id="add-event-fee"
                    type="text"
                    placeholder="예: 무료 / 5,000원"
                    value={newEvent.fee}
                    onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">신청 방법</label>
                  <input
                    id="add-event-registration"
                    type="text"
                    placeholder="예: 구글 폼 신청 / 선착순 입장"
                    value={newEvent.registration}
                    onChange={(e) => setNewEvent({ ...newEvent, registration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">연락처</label>
                  <input
                    id="add-event-phone"
                    type="text"
                    placeholder="예: 033-370-0000"
                    value={newEvent.phone}
                    onChange={(e) => setNewEvent({ ...newEvent, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">준비물</label>
                  <input
                    id="add-event-supplies"
                    type="text"
                    placeholder="예: 텀블러, 편안한 운동화"
                    value={newEvent.supplies}
                    onChange={(e) => setNewEvent({ ...newEvent, supplies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">행사 소개</label>
                <textarea
                  id="add-event-description"
                  required
                  rows={3}
                  placeholder="행사에 대한 구체적인 소개 및 참여 혜택 등을 입력해 주세요."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="add-event-is-outdoor"
                  type="checkbox"
                  checked={newEvent.isOutdoor}
                  onChange={(e) => setNewEvent({ ...newEvent, isOutdoor: e.target.checked })}
                  className="w-4 h-4 text-[#4A6741] focus:ring-[#4A6741] border-slate-300 rounded"
                />
                <label htmlFor="add-event-is-outdoor" className="text-xs font-semibold text-slate-700">야외에서 열리는 행사입니까?</label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  id="cancel-add-event-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  취소
                </button>
                <button
                  id="submit-add-event-btn"
                  type="submit"
                  className="px-4 py-2 bg-[#4A6741] hover:bg-[#3d5535] text-white rounded-xl text-xs font-bold transition-all"
                >
                  행사 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 가상 QR 스탬프 스캐너 모달 */}
      {showStampModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[#E0E0D5] w-full max-w-sm overflow-hidden shadow-2xl text-center p-6 animate-scale-in" id="stamp-scanner-modal">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#4A6741] bg-[#4A6741]/10 px-3 py-1 rounded-full">QR 스탬프 인증</span>
              <button 
                id="close-stamp-modal-btn"
                onClick={() => setShowStampModal(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif font-bold text-base text-slate-900 mb-2">
              {selectedEvent.title}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              행사장에 비치된 스탬프 전용 QR코드를 인식하는 가상 카메라 시뮬레이터입니다. 아래 '스캔 및 인증' 버튼을 눌러주세요.
            </p>

            {stampSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <p className="text-sm font-bold text-emerald-700">인증이 성공적으로 완료되었습니다!</p>
                <p className="text-xs text-slate-500">내 스탬프 보관함에 1개 추가되었습니다.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {/* 가상 QR 프레임 */}
                <div className="relative w-44 h-44 border-4 border-dashed border-[#4A6741] rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4A6741]/10 to-transparent animate-pulse"></div>
                  <QrCode className="w-24 h-24 text-slate-800 opacity-80" />
                  {/* 가상 스캔 붉은 레이저선 */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 top-1/2 animate-bounce"></div>
                </div>

                <div className="w-full space-y-2">
                  <button
                    id="execute-stamp-btn"
                    onClick={handleStampCertification}
                    className="w-full py-3 bg-[#4A6741] hover:bg-[#3d5535] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    가상 QR코드 스캔 수행
                  </button>
                  <button
                    id="cancel-stamp-btn"
                    onClick={() => setShowStampModal(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    스캔 취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. 페이지 하단 장식 푸터 */}
      <footer className="mt-12 bg-[#2D2D2A] text-white/90 py-10 px-6 border-t border-slate-800" id="app-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-serif font-bold text-emerald-400 text-base mb-3">영월 축제·행사 온가이드</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              본 서비스는 강원특별자치도 영월군의 수려한 생태 자원과 유서 깊은 문화제를 전 세계에 알리고, 학교와 지역사회의 자발적인 행사 참여를 활성화하기 위해 구축된 AI 가이드 종합 서비스입니다.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">관광 정보 문의처</h4>
            <ul className="text-xs text-slate-400 space-y-2 font-mono">
              <li>📞 영월군청 문화관광과 : 033-370-2542</li>
              <li>📞 영월문화관광재단 : 033-375-6353</li>
              <li>📞 영월종합관광안내소 : 033-374-2101</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">스탬프 투어 리워드 수령</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              디지털 스탬프 3개를 모두 채운 고객님은 영월역 관광안내소 또는 동강둔치 본부석에서 실물 인증서를 제출하시어 모바일 상품권 및 교환권(동강 한우 할인 등)으로 즉시 교환받으실 수 있습니다.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          <p>© 2026 Yeongwol-gun Cultural Center & AI Assistant. Developed for Local Community Activation.</p>
        </div>
      </footer>

    </div>
  );
}
