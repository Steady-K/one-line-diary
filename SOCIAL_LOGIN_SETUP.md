# 소셜 로그인 설정 가이드

카카오톡과 구글 SNS 로그인을 구현했습니다! 이제 OAuth 앱을 설정하고 환경 변수를 구성하면 됩니다.

## 🔧 환경 변수 설정

`.env.local` 파일에 다음 환경 변수들을 추가해주세요:

```env
# Supabase 설정 (기존)
NEXT_PUBLIC_SUPABASE_URL=https://iiqubthhdbecrxrwxosx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXVidGhoZGJlY3J4cnd4b3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODQ2OTQsImV4cCI6MjA3NDY2MDY5NH0.bFrO4WB3UTIJmwtMymw9S3fEqqNDZ22v-8f5nndkI-A
DATABASE_URL="postgresql://postgres.iiqubthhdbecrxrwxosx:kiCQx12ccwp14JSS@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# NextAuth 설정
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth 설정
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Stripe 설정 (기존)
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

---

## 🔍 Google OAuth 설정

### 1. Google Cloud Console 접속

- [Google Cloud Console](https://console.cloud.google.com/) 접속
- 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. OAuth 동의 화면 설정

- 좌측 메뉴 → "API 및 서비스" → "OAuth 동의 화면"
- 사용자 유형: "외부" 선택
- 앱 이름: "한줄 일기" (또는 원하는 이름)
- 사용자 지원 이메일: 본인 이메일
- 개발자 연락처 정보: 본인 이메일
- 범위 추가: 기본 범위만 사용 (이메일, 프로필)

### 3. OAuth 클라이언트 ID 생성

- 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
- "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
- 애플리케이션 유형: "웹 애플리케이션"
- 이름: "한줄 일기 Web Client"
- 승인된 JavaScript 원본:
  ```
  http://localhost:3000
  https://your-domain.com
  ```
- 승인된 리디렉션 URI:
  ```
  http://localhost:3000/api/auth/callback/google
  https://your-domain.com/api/auth/callback/google
  ```

### 4. 클라이언트 ID와 시크릿 복사

- 생성된 클라이언트 ID와 클라이언트 시크릿을 `.env.local`에 추가

---

## 🟡 Kakao OAuth 설정

### 1. Kakao Developers 접속

- [Kakao Developers](https://developers.kakao.com/) 접속
- 카카오 계정으로 로그인

### 2. 애플리케이션 생성

- "내 애플리케이션" → "애플리케이션 추가하기"
- 앱 이름: "한줄 일기"
- 사업자명: 본인 이름 또는 회사명

### 3. 플랫폼 설정

- 생성된 앱 선택 → "플랫폼" 탭
- "Web 플랫폼 등록" 클릭
- 사이트 도메인 추가:
  ```
  http://localhost:3000
  https://your-domain.com
  ```

### 4. 제품 설정 - 카카오 로그인

- 좌측 메뉴 → "제품 설정" → "카카오 로그인"
- "카카오 로그인" 활성화
- "Redirect URI" 설정:
  ```
  http://localhost:3000/api/auth/callback/kakao
  https://your-domain.com/api/auth/callback/kakao
  ```
- "동의항목" 설정:
  - 닉네임: 필수 동의
  - 카카오계정(이메일): 선택 동의 (필요시 필수로 변경)

### 5. 앱 키 복사

- "앱 설정" → "앱 키" 탭
- REST API 키를 `.env.local`의 `KAKAO_CLIENT_ID`에 추가
- 시크릿 키를 `.env.local`의 `KAKAO_CLIENT_SECRET`에 추가

---

## 🔐 NextAuth Secret 설정

보안을 위해 강력한 시크릿 키를 생성해주세요:

```bash
# 터미널에서 실행
openssl rand -base64 32
```

생성된 키를 `.env.local`의 `NEXTAUTH_SECRET`에 추가하세요.

---

## 🚀 테스트 방법

### 1. 개발 서버 실행

```bash
npm run dev
```

### 2. 로그인 페이지 접속

- http://localhost:3000/auth/signin
- http://localhost:3000/auth/signup

### 3. 소셜 로그인 테스트

- Google 로그인 버튼 클릭
- Kakao 로그인 버튼 클릭
- 각각의 OAuth 플로우가 정상 작동하는지 확인

---

## 🔧 문제 해결

### Google 로그인이 안 될 때

1. **OAuth 동의 화면 상태 확인**

   - "게시됨" 상태인지 확인
   - 테스트 사용자로 본인 이메일 추가

2. **리디렉션 URI 확인**

   - 정확한 URL이 등록되었는지 확인
   - `http://localhost:3000/api/auth/callback/google`

3. **클라이언트 ID/시크릿 확인**
   - `.env.local`에 올바른 값이 설정되었는지 확인

### Kakao 로그인이 안 될 때

1. **앱 상태 확인**

   - 앱이 활성화 상태인지 확인
   - 플랫폼이 올바르게 등록되었는지 확인

2. **리디렉션 URI 확인**

   - 정확한 URL이 등록되었는지 확인
   - `http://localhost:3000/api/auth/callback/kakao`

3. **앱 키 확인**
   - REST API 키와 시크릿 키가 올바른지 확인

### 일반적인 문제

1. **환경 변수 재시작**

   - `.env.local` 수정 후 개발 서버 재시작

   ```bash
   npm run dev
   ```

2. **브라우저 캐시 클리어**

   - 개발자 도구 → Application → Storage → Clear site data

3. **콘솔 에러 확인**
   - 브라우저 개발자 도구에서 에러 메시지 확인

---

## 🎉 완성!

소셜 로그인이 성공적으로 구현되었습니다!

### 구현된 기능들:

- ✅ Google OAuth 로그인
- ✅ Kakao OAuth 로그인
- ✅ 자동 사용자 생성 (Prisma + Supabase)
- ✅ 자동 식물 및 구독 생성
- ✅ 소셜 로그인 UI 컴포넌트
- ✅ 에러 처리 및 로딩 상태

### 사용자 경험:

1. **소셜 로그인 버튼 클릭**
2. **OAuth 제공자에서 인증**
3. **자동으로 계정 생성**
4. **식물과 구독 정보 자동 설정**
5. **일기 작성 페이지로 이동**

이제 사용자들이 간편하게 Google이나 Kakao 계정으로 로그인할 수 있습니다! 🎊
