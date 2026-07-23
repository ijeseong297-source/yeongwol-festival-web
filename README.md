# 🌲 영월 축제·행사 온가이드 (Yeongwol Festival & Event Guide)

강원도 영월군의 축제, 공연, 전시, 체험 행사 및 날씨 정보를 한눈에 확인하고, AI 비서 "영이"와 함께 여행 일정을 계획할 수 있는 웹 어플리케이션입니다.

---

## 🚀 GitHub Pages 배포 방법 (GitHub Pages Deployment Guide)

이 프로젝트는 **GitHub Actions**를 활용하여 저장소에 소스 코드를 올려놓기만 하면 **자동으로 GitHub Pages로 무료 배포**되도록 설정되어 있습니다.

### 1단계: GitHub에 소스코드 올리기
컴퓨터 터미널(또는 VS Code 터미널)에서 아래 명령어를 순서대로 실행하세요.

```bash
# 1. 저장소 초기화 (아직 안 한 경우)
git init

# 2. 모든 변경사항 추가 및 커밋
git add .
git commit -m "feat: 영월 축제·행사 가이드 프로젝트 준비"

# 3. GitHub 브랜치를 main으로 설정
git branch -M main

# 4. 내 GitHub 저장소 주소 연결 (YOUR_USERNAME과 YOUR_REPOSITORY를 실제 이름으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 5. GitHub에 푸시
git push -u origin main
```

---

### 2단계: GitHub Pages 권한 설정하기
GitHub 웹사이트에서 푸시한 저장소 페이지로 이동한 후:

1. 상단 탭에서 **Settings** 선택
2. 왼쪽 메뉴에서 **Pages** 선택
3. **Build and deployment** 섹션 아래의 **Source** 드롭다운을 클릭
4. `Deploy from a branch`에서 **`GitHub Actions`** 로 변경 설정
5. 저장소의 **Actions** 탭으로 가면 배포 워크플로우가 자동으로 실행되어 **약 1~2분 내에 나만의 배포 URL**(예: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`)이 생성됩니다!

---

### 3단계: (선택 사항) Gemini API 키 설정하기
GitHub Pages 정적 환경에서도 AI 챗봇 및 맞춤 추천이 작동할 수 있도록 Gemini API 키를 추가하려면:

1. 저장소의 **Settings** -> **Secrets and variables** -> **Actions** 선택
2. **New repository secret** 버튼 클릭
3. Name: `VITE_GEMINI_API_KEY`
4. Value: 구글 AI 스튜디오에서 발급받은 Gemini API 키 입력 후 저장

*(API 키를 설정하지 않아도 내장된 영월 관광 정보 스마트 응답 엔진이 자동으로 작동하여 정상 이용 가능합니다.)*

---

## 🛠️ 주요 기능

1. **행사 및 축제 목록 & 다채로운 필터ing**: 카테고리별(축제, 체험, 전시, 공연, 봉사), 날짜별, 검색어별 실시간 필터링
2. **달력 및 카카오맵/네이버지도 길찾기 연동**: 행사 장소 길찾기 및 위치 시뮬레이터 제공
3. **AI 비서 '영이' 챗봇**: 영월 축제, 주차, 날씨, 입장료, 주변 관광지 실시간 질의응답
4. **AI 맞춤 추천**: 관심 카테고리 및 방문 일정 기준 추천 행사 제시
5. **모바일 스탬프 투어**: QR 스탬프 인증 및 리워드 쿠폰 발급 기능
6. **행사 알림 신청 & 신규 행사 등록**: 방문 예정 행사 알림 저장 및 사용자 직접 행사 등록
