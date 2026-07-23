import React, { useState } from 'react';
import { MapPin, Navigation, Car, Train, Eye, ArrowRight, Info } from 'lucide-react';
import { EventItem } from '../types';

interface MapSimulatorProps {
  event: EventItem;
}

export default function MapSimulator({ event }: MapSimulatorProps) {
  const [startPoint, setStartPoint] = useState<'station' | 'terminal' | 'office'>('station');
  const [transport, setTransport] = useState<'car' | 'bus' | 'walk'>('car');

  // 출발지 좌표 및 설명
  const startPoints = {
    station: { name: 'KTX 영월역', lat: 37.1818, lng: 128.4754, desc: '강원선 철도역' },
    terminal: { name: '영월시외버스터미널', lat: 37.1865, lng: 128.4611, desc: '대중교통 중심지' },
    office: { name: '영월군청', lat: 37.1837, lng: 128.4618, desc: '행정 중심지' }
  };

  const startInfo = startPoints[startPoint];

  // 간단한 하베르사인 공식으로 거리 계산 (km)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 지구 반경
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const distance = getDistance(startInfo.lat, startInfo.lng, event.latitude, event.longitude);

  // 거리 기반 소요 시간 및 요금 정보 생성
  const calculateInfo = () => {
    const dist = distance || 1.5;
    let duration = 0;
    let cost = '무료';
    let route = '';

    if (transport === 'car') {
      duration = Math.max(Math.round(dist * 2.2), 3);
      cost = `택시비 약 ${Math.max(Math.round(3800 + dist * 1200), 4000).toLocaleString()}원`;
      route = `${startInfo.name} 출발 ➔ 영월 청령포로 우회전 ➔ ${event.location.split('(')[0]} 도착`;
    } else if (transport === 'bus') {
      duration = Math.max(Math.round(dist * 5.5), 10);
      cost = '시내버스 1,400원';
      route = `일반 시내버스 100번대 탑승 ➔ ${event.title.includes('사진') ? '동강사진박물관역' : '군청앞 정류장'} 하차 ➔ 도보 이동`;
    } else {
      duration = Math.round(dist * 15);
      cost = '도보 (0원)';
      route = `${startInfo.name}에서 인도 동선 이용 ➔ 강변 데크길 경유 ➔ ${event.location.split('(')[0]} 도보 진입`;
    }

    return { duration, cost, route };
  };

  const navigationInfo = calculateInfo();

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200" id="map-simulator-container">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-600 animate-pulse" />
          영월 길찾기 및 위치 시뮬레이터
        </h4>
        <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
          위경도: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
        </span>
      </div>

      {/* 가상 미니 맵 그래픽 인터페이스 */}
      <div className="relative h-44 w-full bg-emerald-50 rounded-lg border border-slate-200 overflow-hidden mb-4 flex flex-col justify-between p-3 shadow-inner">
        {/* 그리드 및 영월 산맥 장식 */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]"></div>
        <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-emerald-100 to-transparent"></div>
        
        {/* 가상 물결 (동강) */}
        <div className="absolute left-1/4 top-0 bottom-0 w-8 bg-blue-100/60 blur-md transform -rotate-12 pointer-events-none"></div>

        {/* 출발지 마커 */}
        <div className="absolute" style={{ left: '15%', top: '60%' }}>
          <div className="flex flex-col items-center">
            <span className="bg-white text-[10px] font-bold text-slate-700 px-1.5 py-0.5 rounded shadow border border-slate-200 whitespace-nowrap">
              📍 {startInfo.name}
            </span>
            <div className="w-2 h-2 bg-slate-800 rounded-full border-2 border-white animate-ping"></div>
          </div>
        </div>

        {/* 목적지 마커 */}
        <div className="absolute animate-bounce" style={{ right: '20%', top: '25%' }}>
          <div className="flex flex-col items-center">
            <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
              ✨ {event.title.substring(0, 10)}...
            </span>
            <MapPin className="w-6 h-6 text-emerald-600 -mt-1 drop-shadow" />
          </div>
        </div>

        {/* 안내 메시지 / 동적 경로 연결선 */}
        <div className="z-10 bg-white/90 backdrop-blur-xs p-1.5 rounded text-[11px] text-slate-600 border border-slate-200 shadow-xs max-w-[180px]">
          <span className="font-bold text-slate-800">거리: </span>
          <span className="text-emerald-700 font-mono font-bold">{distance} km</span>
        </div>

        <div className="z-10 text-[10px] text-slate-400 self-end">
          * 동강의 경관을 따라 구성된 가상 안내 지도입니다
        </div>
      </div>

      {/* 출발지 선택 칩 */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">출발지 선택</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            id="start-station-btn"
            onClick={() => setStartPoint('station')}
            className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
              startPoint === 'station'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            KTX 영월역
          </button>
          <button
            id="start-terminal-btn"
            onClick={() => setStartPoint('terminal')}
            className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
              startPoint === 'terminal'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            시외버스터미널
          </button>
          <button
            id="start-office-btn"
            onClick={() => setStartPoint('office')}
            className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-all ${
              startPoint === 'office'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            영월군청
          </button>
        </div>
      </div>

      {/* 교통 수단 선택 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">교통수단 선택</label>
        <div className="flex gap-2">
          <button
            id="transport-car-btn"
            onClick={() => setTransport('car')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-medium transition-all ${
              transport === 'car'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            자가용/택시
          </button>
          <button
            id="transport-bus-btn"
            onClick={() => setTransport('bus')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-medium transition-all ${
              transport === 'bus'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            시내버스
          </button>
          <button
            id="transport-walk-btn"
            onClick={() => setTransport('walk')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border font-medium transition-all ${
              transport === 'walk'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            도보 이동
          </button>
        </div>
      </div>

      {/* 안내 상세 정보 */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">추천 소요시간</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1">
            약 <span className="text-emerald-600 text-lg font-mono">{navigationInfo.duration}</span>분
          </span>
        </div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-slate-100">
          <span className="text-xs text-slate-400">예상 소요경비</span>
          <span className="font-semibold text-slate-800">{navigationInfo.cost}</span>
        </div>

        {/* 가상 상세 경로 설명 */}
        <div className="mt-2.5">
          <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" /> 가상 길찾기 경로 요약
          </p>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-55 p-2 rounded border border-slate-100 italic">
            {navigationInfo.route}
          </p>
        </div>
      </div>
    </div>
  );
}
