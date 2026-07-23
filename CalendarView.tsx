import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { EventItem } from '../types';

interface CalendarViewProps {
  events: EventItem[];
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  onAskAICalendar: (date: string) => void;
  isAiLoading: boolean;
}

export default function CalendarView({
  events,
  selectedDate,
  onDateSelect,
  onAskAICalendar,
  isAiLoading
}: CalendarViewProps) {
  // 2026년 7월로 디폴트 세팅 (사용자 현재 시각: 2026-07-13)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 7: 7월, 8: 8월 등

  // 요일 헤더
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 월별 일수 및 시작 요일 구하기
  const getMonthData = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    return { firstDayIndex, totalDays };
  };

  const { firstDayIndex, totalDays } = getMonthData(currentYear, currentMonth);

  // 달력 격자 채우기
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  // 이전/다음 월 이동
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // 특정 일자가 특정 행사의 기간에 포함되는지 확인
  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(evt => evt.startDate <= dateStr && evt.endDate >= dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  // 선택한 날짜에 속하는 행사들
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const selectedDateEvents = events.filter(evt => evt.startDate <= selectedDate && evt.endDate >= selectedDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" id="calendar-view-section">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-600" />
          월별 달력으로 일정 찾기
        </h3>
        <div className="flex items-center gap-3 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
          <button
            id="prev-month-btn"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white rounded-full text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-800 min-w-[70px] text-center font-mono">
            {currentYear}년 {currentMonth}월
          </span>
          <button
            id="next-month-btn"
            onClick={handleNextMonth}
            className="p-1 hover:bg-white rounded-full text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 요일 그리드 */}
      <div className="grid grid-cols-7 text-center gap-1 mb-2 text-xs font-semibold text-slate-400">
        {weekDays.map((day, idx) => (
          <div key={day} className={idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-11"></div>;
          }

          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const dayEvents = getEventsForDate(currentYear, currentMonth, day);
          const isToday = dateStr === '2026-07-13'; // 2026-07-13일 기준오늘

          return (
            <button
              key={`day-${day}`}
              id={`day-${currentMonth}-${day}-btn`}
              onClick={() => handleDayClick(day)}
              className={`h-11 relative flex flex-col items-center justify-between py-1 rounded-lg transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : isToday
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-slate-700 border-transparent hover:bg-slate-50'
              }`}
            >
              <span className="text-xs">{day}</span>
              {/* 행사 수 표시 도트 */}
              <div className="flex gap-0.5 justify-center mt-auto">
                {dayEvents.slice(0, 3).map((evt, eIdx) => {
                  let dotColor = 'bg-emerald-400';
                  if (evt.category === '학교행사') dotColor = 'bg-indigo-400';
                  else if (evt.category === '공연') dotColor = 'bg-rose-400';
                  else if (evt.category === '체험') dotColor = 'bg-amber-400';
                  else if (evt.category === '봉사활동') dotColor = 'bg-blue-400';

                  return (
                    <span
                      key={eIdx}
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : dotColor}`}
                    ></span>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className={`text-[8px] leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>+</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택한 날짜 일정 상세 영역 */}
      <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">
              📅 {selMonth}월 {selDay}일의 행사 일정
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">선택한 날짜에 진행 중인 행사 목록입니다.</p>
          </div>
          {/* AI 추천 요청 단추 */}
          <button
            id="ask-ai-by-date-btn"
            onClick={() => onAskAICalendar(selectedDate)}
            disabled={isAiLoading}
            className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-full font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            이 날짜 맞춤 행사 AI 추천받기
          </button>
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-lg border border-slate-200/50">
            <p className="text-sm text-slate-400">해당 날짜에 예정된 공식 행사가 없습니다.</p>
            <p className="text-xs text-slate-300 mt-1">이 날짜에 참관하고 싶은 개인/학교 일정을 등록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateEvents.map(evt => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/50 hover:border-emerald-300 transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded-sm font-semibold text-[10px] ${
                      evt.category === '축제'
                        ? 'bg-emerald-100 text-emerald-800'
                        : evt.category === '학교행사'
                        ? 'bg-indigo-100 text-indigo-800'
                        : evt.category === '공연'
                        ? 'bg-rose-100 text-rose-800'
                        : evt.category === '체험'
                        ? 'bg-amber-100 text-amber-800'
                        : evt.category === '전시'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {evt.category}
                  </span>
                  <span className="font-semibold text-slate-800">{evt.title}</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] whitespace-nowrap pl-2">
                  {evt.startDate === evt.endDate ? '당일 행사' : `${evt.startDate.substring(5)} ~ ${evt.endDate.substring(5)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
