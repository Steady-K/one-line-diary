# 구독 결제 디버깅 가이드

## 🚨 배포 환경에서 구독 결제 후 프리미엄 상태가 업데이트되지 않는 문제 해결

### 📋 문제 분석

배포 환경에서 구독 결제 후에도 프리미엄 상태가 `false`로 유지되는 문제가 발생하고 있습니다.

### 🔍 주요 원인들

1. **Supabase 환경 변수 설정 문제**
2. **웹훅 처리 실패**
3. **데이터베이스 연결 문제**
4. **세션 인증 문제**

### 🛠️ 해결 방법

#### 1. 환경 변수 확인

배포 환경에서 다음 환경 변수들이 올바르게 설정되어 있는지 확인하세요:

```bash
# Vercel 환경 변수 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 2. 로그 확인 방법

배포 후 결제 시도 시 다음 로그들을 확인하세요:

1. **브라우저 개발자 도구 콘솔**
2. **Vercel 함수 로그**
3. **Supabase 대시보드 로그**

#### 3. 단계별 디버깅

##### Step 1: 결제 성공 페이지에서 로그 확인

```
구독 상태 확인 시작: {orderId, paymentKey, amount, retryCount}
수동 구독 생성 요청: {userId, email, env, supabaseUrl, supabaseKey, serviceKey}
```

##### Step 2: Supabase 연결 상태 확인

```
구독 생성 시도: {user_id, plan_type, status, ...}
구독 생성 성공: {id, user_id, plan_type, ...}
```

##### Step 3: 구독 상태 조회 확인

```
활성 구독 조회 시도: {userId, userEmail}
활성 구독 조회 성공: {id, plan_type, status, ...}
```

### 🔧 추가 수정 사항

#### 1. 재시도 로직 강화

- 결제 성공 페이지에서 최대 3회 재시도
- 각 재시도 간 2초 대기
- 상세한 로그 출력

#### 2. 웹훅 처리 개선

- 기존 구독 확인 후 업데이트 또는 새로 생성
- 더 자세한 에러 로깅
- 사용자 조회 실패 시 대안 처리

#### 3. Supabase 함수 개선

- 모든 데이터베이스 작업에 상세 로깅 추가
- 에러 발생 시 원인 파악을 위한 정보 출력
- 환경 변수 설정 상태 확인

### 🚀 배포 후 테스트 방법

1. **결제 테스트**

   - 실제 결제 진행
   - 브라우저 콘솔에서 로그 확인
   - 결제 성공 페이지에서 재시도 로직 동작 확인

2. **구독 상태 확인**

   - `/api/subscription` 엔드포인트 직접 호출
   - 프리미엄 기능 접근 테스트
   - 일기 작성 페이지에서 프리미엄 상태 확인

3. **수동 구독 생성 테스트**
   - `/api/payment/force-subscription` 엔드포인트 호출
   - 강제 구독 생성 후 상태 확인

### 📞 문제 지속 시 확인사항

1. **Supabase 프로젝트 설정**

   - RLS(Row Level Security) 정책 확인
   - 테이블 권한 설정 확인
   - API 키 유효성 확인

2. **Vercel 배포 설정**

   - 환경 변수 재설정
   - 함수 타임아웃 설정 확인
   - 지역 설정 확인

3. **토스페이먼츠 설정**
   - 웹훅 URL 설정 확인
   - 테스트/실제 환경 구분 확인
   - 결제 승인 후 콜백 처리 확인

### 🔄 롤백 방법

문제가 지속될 경우 다음 방법으로 롤백:

1. **강제 구독 생성 API 사용**

   ```bash
   POST /api/payment/force-subscription
   ```

2. **수동 데이터베이스 업데이트**

   ```sql
   UPDATE subscriptions
   SET plan_type = 'premium', status = 'active'
   WHERE user_id = [사용자ID];
   ```

3. **Supabase 대시보드에서 직접 수정**

### 📝 로그 모니터링

배포 후 다음 로그들을 지속적으로 모니터링하세요:

- `토스페이먼츠 웹훅 수신`
- `결제 승인 완료`
- `구독 생성 완료`
- `구독 상태 새로고침`

이 가이드를 따라 문제를 해결할 수 있습니다. 추가 문제가 발생하면 로그를 확인하고 구체적인 에러 메시지를 공유해주세요.
