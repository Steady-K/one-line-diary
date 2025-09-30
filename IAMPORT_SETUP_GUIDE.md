# 아임포트 설정 가이드

## 🚀 아임포트로 결제 시스템 변경 완료!

토스페이먼츠에서 아임포트로 성공적으로 변경되었습니다. 아임포트는 무료 테스트 환경을 제공하여 실제 돈 없이도 결제 시스템을 테스트할 수 있습니다.

## 📋 설정 단계

### 1단계: 아임포트 계정 생성

1. **아임포트 홈페이지 접속**
   - https://www.iamport.kr/ 방문
   - 회원가입 및 로그인

2. **가맹점 등록**
   - 사업자등록증 업로드 (무료 테스트도 가능)
   - 가맹점 식별코드 발급

### 2단계: 환경변수 설정

`.env.local` 파일에 다음 내용 추가:

```bash
# 아임포트 설정
NEXT_PUBLIC_IMP_CODE=imp123456789  # 아임포트 가맹점 식별코드
IMP_ACCESS_TOKEN=your_access_token  # 아임포트 액세스 토큰

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Supabase 설정 (기존 설정 유지)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth (기존 설정 유지)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth (기존 설정 유지)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 3단계: 아임포트 대시보드 설정

1. **가맹점 식별코드 확인**
   - 대시보드 → 설정 → 가맹점 정보
   - `imp_`로 시작하는 코드 복사

2. **액세스 토큰 발급**
   - 대시보드 → API 키 관리
   - REST API 키 복사

3. **PG사 설정**
   - 결제 → PG사 설정
   - html5_inicis, kakaopay, nice 등 선택

### 4단계: Supabase 스키마 업데이트

다음 SQL을 Supabase에서 실행:

```sql
-- 아임포트 관련 필드 추가
ALTER TABLE subscriptions 
ADD COLUMN imp_uid VARCHAR(255),
ADD COLUMN imp_merchant_uid VARCHAR(255);

-- 인덱스 추가
CREATE INDEX idx_subscriptions_imp_uid ON subscriptions(imp_uid);
CREATE INDEX idx_subscriptions_imp_merchant_uid ON subscriptions(imp_merchant_uid);
```

### 5단계: 테스트 카드 정보

**성공 테스트 카드:**
- 카드 번호: 4242 4242 4242 4242
- 만료일: 12/25
- CVC: 123
- 비밀번호: 12

**실패 테스트 카드:**
- 카드 번호: 4000 0000 0000 0002 (거부됨)
- 카드 번호: 4000 0000 0000 9995 (잔액 부족)

## 🔧 변경된 파일들

### 1. 결제 페이지 (`app/payment/page.tsx`)
- 토스페이먼츠 SDK → 아임포트 SDK로 변경
- 결제 플로우 아임포트 방식으로 수정
- 결제 검증 로직 추가

### 2. 웹훅 API (`app/api/payment/iamport-webhook/route.ts`)
- 아임포트 결제 검증 로직
- 서버사이드 결제 확인
- 구독 상태 업데이트

### 3. Supabase 서비스 (`lib/supabase.ts`)
- 아임포트 관련 함수 추가
- `updateSubscriptionByImpMerchantUid` 함수

### 4. 스키마 업데이트 (`update-subscription-schema-iamport.sql`)
- 아임포트 필드 추가
- 인덱스 생성

## 🎯 아임포트 장점

1. **무료 테스트**: 실제 돈 없이 테스트 가능
2. **한국 최적화**: 카카오페이, 네이버페이, 계좌이체 등 지원
3. **간단한 연동**: 명확한 API 문서
4. **신뢰성**: 많은 한국 스타트업이 사용
5. **다양한 PG사**: html5_inicis, kakaopay, nice 등 선택 가능

## 🚀 배포 및 테스트

1. **환경변수 설정**
   ```bash
   # 로컬 테스트
   npm run dev
   
   # Vercel 배포
   vercel --prod
   ```

2. **결제 테스트**
   - `http://localhost:3000/payment` 접속
   - "프리미엄 시작하기" 클릭
   - 테스트 카드 정보 입력
   - 결제 완료 확인

3. **웹훅 테스트**
   - 결제 성공 후 구독 상태 확인
   - 데이터베이스에서 구독 정보 확인

## ⚠️ 주의사항

1. **테스트 환경**: 개발 중에는 테스트 키 사용
2. **실제 결제**: 운영 환경에서는 실제 키 사용
3. **보안**: 액세스 토큰은 서버에서만 사용
4. **수수료**: 거래 시에만 부과 (카드 2.9% + 100원)

## 📞 지원

- **아임포트 공식 문서**: https://docs.iamport.kr/
- **고객센터**: 1588-1234
- **기술 지원**: support@iamport.kr

이제 무료로 결제 시스템을 테스트할 수 있습니다! 🎉
