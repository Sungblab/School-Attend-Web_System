# School Attend Web System

## 프로젝트 소개 (Project Overview)

**School Attend Web System**은 학교 출석 관리를 위한 통합 웹 플랫폼입니다. 학생들은 개인 모바일 기기를 통해 암호화된 QR 코드를 생성하여 출석을 인증할 수 있으며, 관리자와 선생님은 실시간으로 출석 현황을 모니터링하고 관리할 수 있습니다.

이 시스템은 보안성을 강화하기 위해 AES-256 암호화를 사용한 동적 QR 코드를 생성하며, 기기 고유 ID를 활용하여 대리 출석을 방지합니다. 웹 프론트엔드, 관리자 대시보드, 백엔드 서버, 그리고 모바일 앱(React Native)으로 구성되어 있습니다.

---

## 주요 기능 (Key Features)

### 1. 학생 (Student)

- **로그인 및 회원가입**: 학번 기반의 안전한 회원가입 및 로그인.
- **QR 코드 생성**: 매번 갱신되는 암호화된 QR 코드를 통해 출석 인증.
- **출석 현황 조회**: 자신의 출석 기록 및 상태(출석, 지각, 결석) 확인.
- **개인정보 관리**: 비밀번호 변경 및 계정 정보 수정.

### 2. 관리자 및 선생님 (Admin & Teacher)

- **대시보드**: 실시간 출석 현황, 지각자, 결석자 통계 시각화.
- **학생 관리**: 회원가입 승인, 학생 정보 수정, 권한 관리(리더, 선생님 등).
- **출석 관리**: 수동 출석/지각/결석 처리, QR 리더기 모드 지원.
- **통계 및 리포트**: 기간별, 학급별 출석 통계 데이터 제공 및 랭킹 시스템.
- **시스템 설정**: 출석 인정 시간(지각, 결석 기준) 설정.

### 3. 보안 (Security)

- **토큰 기반 인증**: JWT(JSON Web Token)를 사용한 안전한 세션 관리.
- **QR 코드 암호화**: AES-256 알고리즘을 사용하여 QR 코드 위변조 방지.
- **기기 제어**: 1인 1기기 정책을 위해 기기 고유 ID(Device ID) 검증.

---

## 기술 스택 (Tech Stack)

### Backend (attend-backend)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: bcryptjs, helmet, cors, crypto (AES-256)
- **Authentication**: jsonwebtoken (JWT)
- **Utilities**: node-schedule (스케줄링), winston (로깅), xlsx (데이터 엑셀 변환)

### Frontend - Student & Admin (attend-front / attend-front-admin)

- **Core**: HTML5, Vanilla JavaScript (명확하고 가벼운 정적 웹 구조)
- **Styling**: Tailwind CSS
- **Network**: Axios (API 통신을 위한 HTTP 클라이언트)
- **Build Tool**: Tailwind CLI (CSS 컴파일 및 최적화)

### Mobile App (attend-react/attend-app)

- **Framework**: React Native (Expo)
- **Features**: QR Code Generation, Secure Storage, Device Info Access

---

## 폴더 구조 (Folder Structure)

```
School-Attend-Web_System/
├── attend-backend/         # 백엔드 서버 (Node.js/Express)
│   ├── server.js           # 메인 서버 로직 및 API 엔드포인트
│   ├── package.json        # 백엔드 의존성 및 스크립트
│   └── ...
├── attend-front/           # 학생용 정적 웹 프론트엔드 (HTML/JS)
│   ├── index.html          # 로그인 페이지
│   ├── qr.html             # QR 코드 생성 페이지
│   ├── css/                # 스타일시트 (Tailwind CSS 소스/출력)
│   ├── js/                 # 프론트엔드 로직
│   └── ...
├── attend-front-admin/     # 관리자용 정적 웹 프론트엔드 (HTML/JS)
│   ├── dashboard.html      # 관리자 대시보드
│   ├── reader.html         # QR 코드 리더 페이지
│   ├── statistics-dashboard.html # 통계 대시보드
│   └── ...
└── attend-react/           # 모바일 앱 (React Native)
    └── attend-app/         # Expo 프로젝트 소스
```

---

## 설치 및 실행 (Installation & Setup)

### 1. 사전 요구사항 (Prerequisites)

- Node.js (v14 이상 권장)
- MongoDB 인스턴스 (로컬 또는 Atlas)
- npm 또는 yarn 패키지 매니저

### 2. 백엔드 설정 (Backend Setup)

`attend-backend` 디렉토리로 이동하여 의존성을 설치하고 환경 변수를 설정합니다.

```bash
cd attend-backend
npm install
```

`.env` 파일을 생성하고 다음 변수를 설정해야 합니다:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-attend-system
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_byte_secret_key_for_aes
ACCESS_TOKEN_EXPIRES_IN=90d
```

서버 실행:

```bash
npm start
# 또는 개발 모드 (nodemon 필요)
npm run dev
```

### 3. 프론트엔드 설정 (Frontend Setup)

학생용 및 관리자용 프론트엔드는 정적 파일로 서빙되거나 Live Server 등을 통해 실행할 수 있습니다. Tailwind CSS 빌드가 필요할 경우:

```bash
# 학생용 프론트엔드
cd attend-front
npm install
npm run build

# 관리자용 프론트엔드
cd attend-front-admin
npm install
npm run build
```

---

## API 문서 (API Documentation)

주요 API 엔드포인트 예시는 다음과 같습니다:

- **Auth**
  - `POST /api/signup`: 회원가입
  - `POST /api/login`: 로그인 (JWT 발급)
  - `POST /api/change-password`: 비밀번호 변경

- **User**
  - `GET /api/student-info`: 학생 정보 조회
  - `GET /api/admin/users`: 사용자 목록 조회 (관리자 전용)
  - `POST /api/admin/approve-user`: 사용자 가입 승인 (관리자 전용)

- **Attendance**
  - `POST /api/generate-qr`: 출석용 암호화 QR 생성
  - `POST /api/attendance`: QR 스캔 및 출석 처리 (리더/관리자 전용)
  - `GET /api/attendance/stats`: 출석 통계 조회

---

# English Section

## Project Overview

**School Attend Web System** is an integrated web platform for managing school attendance. Students can verify their attendance by generating encrypted QR codes through their personal mobile devices, while administrators and teachers can monitor and manage attendance status in real-time.

The system generates dynamic QR codes using AES-256 encryption to enhance security and leverages unique device IDs to prevent proxy attendance. It consists of a web frontend for students, an administrator dashboard, a backend server, and a mobile app (React Native).

## Key Features

### 1. Student

- **Login & Signup**: Secure registration and login based on student ID.
- **QR Code Generation**: Generate encrypted, time-sensitive QR codes for attendance.
- **Attendance Status**: View personal attendance records and status (Present, Late, Absent).
- **Account Management**: Change passwords and update account information.

### 2. Admin & Teacher

- **Dashboard**: Visualize real-time attendance status, late arrivals, and absences.
- **User Management**: Approve signups, edit student info, and manage permissions (Reader, Teacher).
- **Attendance Management**: Manual attendance processing, support for QR reader mode.
- **Statistics & Reports**: Provide attendance statistics by period or class, including ranking systems.
- **System Settings**: Configure attendance time rules (thresholds for late/absent).

### 3. Security

- **Token-based Authentication**: Secure session management using JWT (JSON Web Token).
- **QR Code Encryption**: Prevent forgery using AES-256 algorithm.
- **Device Control**: Enforce "One Device per Student" policy using Device ID validation.

## Tech Stack

### Backend (attend-backend)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: bcryptjs, helmet, cors, crypto (AES-256)
- **Authentication**: jsonwebtoken (JWT)

### Frontend - Student & Admin (attend-front / attend-front-admin)

- **Core**: HTML5, Vanilla JavaScript (Lightweight Static Web Architecture)
- **Styling**: Tailwind CSS
- **Network**: Axios
- **Build Tool**: Tailwind CLI (CSS Compilation)

### Mobile App (attend-react/attend-app)

- **Framework**: React Native (Expo)
- **Features**: QR Code Generation, Device Info Access

## Installation & Setup

### 1. Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB Instance (Local or Atlas)
- npm or yarn package manager

### 2. Backend Setup

Navigate to the `attend-backend` directory, install dependencies, and configure environment variables.

```bash
cd attend-backend
npm install
```

Create a `.env` file and set the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-attend-system
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_byte_secret_key_for_aes
ACCESS_TOKEN_EXPIRES_IN=90d
```

Run the server:

```bash
npm start
# or for development (requires nodemon)
npm run dev
```

### 3. Frontend Setup

The frontends (student and admin) can be served as static files or using tools like Live Server. If you need to rebuild Tailwind CSS:

```bash
# Student Frontend
cd attend-front
npm install
npm run build

# Admin Frontend
cd attend-front-admin
npm install
npm run build
```
