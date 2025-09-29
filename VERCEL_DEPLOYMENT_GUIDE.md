# Vercel 배포 가이드

## 1. Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
```

## 2. 프로젝트 배포

```bash
vercel
```

또는 GitHub 연동을 통한 자동 배포:

1. GitHub에 코드 푸시
2. Vercel 대시보드에서 GitHub 저장소 연결
3. 자동 배포 설정

## 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### 필수 환경 변수

```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth 설정
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
```

## 4. OAuth 리다이렉트 URL 설정

### Google OAuth

- Google Cloud Console에서 리다이렉트 URL 추가:
  - `https://your-app-name.vercel.app/api/auth/callback/google`

### Kakao OAuth

- Kakao Developers에서 리다이렉트 URL 추가:
  - `https://your-app-name.vercel.app/api/auth/callback/kakao`

## 5. Toss Payments 웹훅 설정

- Toss Payments 대시보드에서 웹훅 URL 설정:
  - `https://your-app-name.vercel.app/api/payment/toss-webhook`

## 6. Supabase RLS 정책 확인

배포 후 Supabase에서 RLS 정책이 올바르게 설정되어 있는지 확인하세요.

## 7. 도메인 설정 (선택사항)

Vercel에서 커스텀 도메인을 설정할 수 있습니다.

## 배포 후 확인사항

1. ✅ 홈페이지 로딩 확인
2. ✅ 로그인/회원가입 기능 확인
3. ✅ 일기 작성 기능 확인
4. ✅ 결제 시스템 확인
5. ✅ 소셜 미디어 공유 확인
6. ✅ PWA 설치 기능 확인
