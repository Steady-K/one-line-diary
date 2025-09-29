# 토스페이먼츠 API 키 찾기 가이드

## 🔑 API 키 찾는 방법

### 1단계: 대시보드 접속

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 로그인
2. 대시보드 메인 페이지 확인

### 2단계: API 키 찾기

다음 중 하나의 방법으로 API 키를 찾을 수 있습니다:

#### 방법 1: 좌측 메뉴에서 찾기

- 좌측 메뉴에서 **"내 애플리케이션"** 또는 **"애플리케이션"** 클릭
- **"테스트"** 탭 선택
- **"API 키"** 섹션에서 확인

#### 방법 2: 설정 메뉴에서 찾기

- 좌측 메뉴에서 **"설정"** 또는 **"계정 설정"** 클릭
- **"API 키"** 또는 **"개발자 설정"** 섹션에서 확인

#### 방법 3: 상단 메뉴에서 찾기

- 상단 메뉴에서 **"개발자"** 또는 **"API"** 클릭
- **"API 키"** 섹션에서 확인

### 3단계: 필요한 키 복사

다음 두 개의 키를 복사하세요:

1. **클라이언트 키 (Client Key)**

   - 형태: `test_ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 용도: 프론트엔드에서 사용

2. **시크릿 키 (Secret Key)**
   - 형태: `test_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 용도: 백엔드에서 사용

## 📝 환경 변수 설정

복사한 키를 `.env.local` 파일에 추가하세요:

```bash
# 토스페이먼츠 API 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_your_actual_key_here
TOSS_SECRET_KEY=test_sk_your_actual_key_here
```

## 🔍 찾을 수 없는 경우

### 대안 1: 애플리케이션 생성

1. **"내 애플리케이션"** → **"애플리케이션 추가"** 클릭
2. 애플리케이션 이름 입력 (예: "한줄일기")
3. 생성 후 API 키 확인

### 대안 2: 고객센터 문의

- 토스페이먼츠 고객센터: 1588-1234
- 이메일: support@tosspayments.com

## ⚠️ 주의사항

1. **테스트 키 사용**: 개발 중에는 반드시 `test_`로 시작하는 키를 사용하세요
2. **키 보안**: 시크릿 키는 절대 프론트엔드에 노출하지 마세요
3. **환경 분리**: 테스트와 운영 환경의 키를 구분해서 사용하세요

## 🚀 다음 단계

API 키를 설정한 후:

1. 개발 서버 재시작: `npm run dev`
2. 결제 테스트: `http://localhost:3001/payment`
3. 웹훅 설정: 개발자센터에서 웹훅 URL 등록

## 📞 도움이 필요한 경우

- 토스페이먼츠 공식 문서: https://docs.tosspayments.com/
- 개발자 커뮤니티: https://developers.tosspayments.com/community
- 기술 지원: support@tosspayments.com
