import { EventItem, WeatherInfo } from './types';

// 영월 기본 행사 데이터
export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'yw-photo-2026',
    title: '제23회 영월 동강국제사진제',
    category: '전시',
    startDate: '2026-07-10',
    endDate: '2026-09-06',
    location: '동강사진박물관 (영월읍 영월로 1909-10)',
    latitude: 37.1873,
    longitude: 128.4633,
    fee: '성인 3,000원 / 청소년 1,500원',
    registration: '현장 예매 및 동강사진박물관 홈페이지 예매',
    supplies: '편안한 복장, 카메라(자유 소지)',
    description: '전 세계의 저명한 사진가들이 참가하여 독창적이고 아름다운 현대 사진 예술을 대중에게 소개하는 국제적인 사진 축제입니다. 실내 전시실과 야외 화랑에서 풍성한 시각 예술을 누릴 수 있습니다.',
    isOutdoor: false,
    organizer: '동강사진마을운영위원회',
    phone: '033-375-4554',
    imageUrl: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-boat-2026',
    title: '2026 영월 동강뗏목축제',
    category: '축제',
    startDate: '2026-07-31',
    endDate: '2026-08-02',
    location: '동강둔치 일원 (영월읍 하송리 254-4)',
    latitude: 37.1852,
    longitude: 128.4691,
    fee: '입장료 무료 (일부 체험 프로그램 유료)',
    registration: '체험 부스별 현장 신청 및 사전 예약',
    supplies: '여벌 옷, 수건, 샌들 또는 아쿠아슈즈, 모자',
    description: '전통 뗏목 시연을 시작으로 동강 물총싸움, 뗏목 타기 체험, 한여름 밤의 버스킹 공연과 푸드트럭 야시장까지 가득한 영월의 대표 여름 물놀이 축제입니다. 무더운 여름 시원한 동강에서 힐링해보세요.',
    isOutdoor: true,
    organizer: '영월문화관광재단',
    phone: '033-375-6353',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-eco-2026',
    title: '동강 여름 생태체험 교실',
    category: '체험',
    startDate: '2026-07-13',
    endDate: '2026-07-15',
    location: '동강생태정보관 (영월읍 삼옥리 160)',
    latitude: 37.2020,
    longitude: 128.4725,
    fee: '5,000원 (체험 재료비 포함)',
    registration: '영월문화관광 홈페이지 온라인 선착순 접수',
    supplies: '개인 텀블러, 편안한 신발',
    description: '동강 유역에 서식하는 희귀 동식물을 관찰하고 친환경 천연 수제비누 만들기, 생태 미술 놀이를 즐기는 어린이/가족 맞춤형 생태 체험 교육입니다.',
    isOutdoor: true,
    organizer: '동강생태정보관',
    phone: '033-370-2611',
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-star-2026',
    title: '별마로천문대 한여름 밤의 별자리 여행',
    category: '체험',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    location: '별마로천문대 (영월읍 천문대길 397)',
    latitude: 37.2025,
    longitude: 128.4842,
    fee: '성인 7,000원 / 청소년 6,000원',
    registration: '별마로천문대 홈페이지 사전 예약제 (잔여분 현장 예매)',
    supplies: '따뜻한 겉옷 (천문대 정상은 기온이 낮음)',
    description: '해발 799.8m 봉래산 정상에 위치한 별마로천문대에서 쏟아질 듯한 밤하늘 은하수를 관측하고 흥미로운 우주 천문학 강연을 들을 수 있는 로맨틱한 별자리 체험입니다.',
    isOutdoor: false,
    organizer: '영월군시설관리공단',
    phone: '033-372-8445',
    imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-arirang-2026',
    title: '영월 아리랑 상설 전통음악공연',
    category: '공연',
    startDate: '2026-07-18',
    endDate: '2026-07-18',
    location: '영월문화예술회관 공연장 (영월읍 하송로 64)',
    latitude: 37.1824,
    longitude: 128.4601,
    fee: '무료 (자율 입장)',
    registration: '공연 시작 30분 전 선착순 입장',
    supplies: '없음',
    description: '강원도 무형문화재인 영월 아리랑을 현대적 감각으로 재해석한 가야금 합주, 창극 및 태평소 사물놀이 합동 공연입니다. 남녀노소 누구나 신명 나게 즐길 수 있는 국악 한마당입니다.',
    isOutdoor: false,
    organizer: '영월국악협회',
    phone: '033-374-2100',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-volunteer-clean',
    title: '동강 유역 환경정화 자원봉사활동',
    category: '봉사활동',
    startDate: '2026-07-19',
    endDate: '2026-07-19',
    location: '동강 섭새강변 주차장 집결 (영월읍 삼옥리)',
    latitude: 37.2131,
    longitude: 128.4902,
    fee: '무료',
    registration: '1365 자원봉사포털 사전 신청 및 현장 등록',
    supplies: '마실 물, 개인 모자, 작업 편한 신발',
    description: '여름 휴가철을 맞아 동강을 찾는 관광객과 영월 군민이 함께 섭새강변 일대의 쓰레기를 수거하고 강 살리기 릴레이에 참여하는 봉사 캠페인입니다. 봉사시간 4시간 인정됩니다.',
    isOutdoor: true,
    organizer: '영월군 자원봉사센터',
    phone: '033-372-1365',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'school-ywhigh-sports',
    title: '영월고등학교 한마음 연합 체육대회',
    category: '학교행사',
    startDate: '2026-07-13',
    endDate: '2026-07-13',
    location: '영월고등학교 운동장 및 실내 체육관 (영월읍 영월로 1833)',
    latitude: 37.1812,
    longitude: 128.4550,
    fee: '없음 (영월고 학생 및 학부모 대상)',
    registration: '학급 및 동아리별 자동 참가',
    supplies: '체육복, 운동화, 개인 텀블러',
    description: '학업에서 벗어나 풋살, 농구, 단체줄넘기, 계주 등을 통해 선후배가 단합하는 영월고의 최대 연합 스포츠 행사입니다. 지역 주민 및 학부모님들의 격려 방문도 환영합니다.',
    isOutdoor: true,
    organizer: '영월고등학교 학생회',
    phone: '033-373-1202',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'school-ywmid-festival',
    title: '영월중학교 청소년 어울림 동아리 종합 발표회',
    category: '학교행사',
    startDate: '2026-07-17',
    endDate: '2026-07-17',
    location: '영월중학교 강당 해오름관 (영월읍 중앙로 179)',
    latitude: 37.1895,
    longitude: 128.4590,
    fee: '무료',
    registration: '영월 관내 중·고등학생 및 가족 누구나 자유 관람',
    supplies: '즐거운 마음',
    description: '영월중학교 전교생이 1학기 동안 갈고닦은 동아리 활동 결과를 공유하는 날입니다. 로봇 축구 코딩 시연, 캘리그래피 전시, 밴드부 및 댄스부 축하 공연이 펼쳐집니다.',
    isOutdoor: false,
    organizer: '영월중학교 동아리 연합 학생회',
    phone: '033-374-0545',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-beer-2026',
    title: '석항 188 수제맥주 축제',
    category: '축제',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    location: '석항 트레인스테이션 일원 (영월군 중동면 석항역길 15)',
    latitude: 37.2078,
    longitude: 128.5779,
    fee: '입장 무료 / 맥주 시음 및 안주 부스 개별 구매',
    registration: '현장 접수 (신분증 지참 필수)',
    supplies: '신분증 (성인 인증용)',
    description: '과거 석탄 수송의 중심지였던 석항역 철길 테마 파크에서 영월 로컬 수제 맥주와 맛있는 안주거리를 맛볼 수 있는 트렌디한 야간 테마 축제입니다. 레트로 가요 감성 콘서트가 매 저녁 열립니다.',
    isOutdoor: true,
    organizer: '석항마을 영농조합법인',
    phone: '033-378-1880',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'yw-kim-2026',
    title: '제29회 난고 김삿갓 문화제',
    category: '축제',
    startDate: '2026-09-25',
    endDate: '2026-09-27',
    location: '김삿갓 유적지 일원 (김삿갓면 와석리)',
    latitude: 37.0805,
    longitude: 128.5375,
    fee: '대부분 무료 (전통 체험 유료)',
    registration: '백일장 및 사생대회 등 홈페이지 사전 신청',
    supplies: '모자, 선크림, 필기도구',
    description: '조선시대 풍자 시인 난고 김삿갓(김병연)의 서민 예술 혼을 기리는 유서 깊은 문화제입니다. 전국 시낭송 대회, 해학 페스티벌, 조선 장터 체험 및 김삿갓 묘역 걷기 행사가 진행됩니다.',
    isOutdoor: true,
    organizer: '영월문화재단',
    phone: '033-375-6353',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60'
  }
];

// 가상 날씨 데이터 (2026년 7월 중순 기준 시뮬레이션)
export const WEATHER_FORECAST: WeatherInfo[] = [
  {
    date: '2026-07-13',
    sky: '구름많음',
    temp: 28,
    message: '활동하기 무난한 날씨입니다. 오후 들어 조금 후텁지근하니 야외 행사 시 수분을 넉넉히 섭취하세요.'
  },
  {
    date: '2026-07-14',
    sky: '비',
    temp: 23,
    message: '영월 지역에 30~50mm의 강수가 예보되어 있습니다. 야외 행사(예: 생태체험 등)는 실내 프로그램으로 대체되거나 시간이 변동될 수 있으니 사전에 행사처에 확인 바랍니다.'
  },
  {
    date: '2026-07-15',
    sky: '맑음',
    temp: 29,
    message: '비가 그친 후 청명하고 눈부신 하늘이 예상됩니다. 야외 자외선 지수가 높으니 모자와 자외선 차단제를 준비하세요.'
  },
  {
    date: '2026-07-16',
    sky: '맑음',
    temp: 31,
    message: '강한 햇볕으로 한낮 기온이 31도까지 오릅니다. 야외 활동 시 그늘진 휴식처를 틈틈이 확인하세요.'
  },
  {
    date: '2026-07-17',
    sky: '흐림',
    temp: 27,
    message: '하늘이 흐리고 선선하여 영월중 동아리 발표회 관람 등 실내외 활동을 하기에 아주 적당한 날씨입니다.'
  },
  {
    date: '2026-07-18',
    sky: '맑음',
    temp: 30,
    message: '전형적인 맑은 여름 날씨입니다. 저녁 시간대의 국악 전통공연 관람 시 선선한 강바람을 맞기 좋습니다.'
  },
  {
    date: '2026-07-19',
    sky: '소나기',
    temp: 26,
    message: '오후 들어 영월 일부 지역에 갑작스러운 소나기 가능성이 높습니다. 자원봉사 등 야외 활동 시 접이식 우산을 휴대하세요.'
  },
  {
    date: '2026-07-20',
    sky: '구름많음',
    temp: 28,
    message: '구름 사이로 햇살이 간간이 비칩니다. 주간 행사 및 일상을 소화하기 쾌적한 예보입니다.'
  }
];

// 가상 날씨 디폴트값 (데이터 범위를 벗어난 날짜 요청 시 반환)
export const DEFAULT_WEATHER: WeatherInfo = {
  date: '',
  sky: '맑음',
  temp: 27,
  message: '즐거운 영월 여행 되세요! 행사장 방문 전 주최 측의 최종 일정 공지를 꼭 확인해 주세요.'
};
