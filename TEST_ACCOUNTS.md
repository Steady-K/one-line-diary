# 테스트용 계정 정보

## 무료 사용자 테스트 계정

- **이메일**: test@example.com
- **비밀번호**: test123
- **구독 상태**: 무료 (광고 노출)

## 프리미엄 사용자 테스트 계정

- **이메일**: premium-test@example.com
- **비밀번호**: premium123
- **구독 상태**: 프리미엄 (광고 제거)
- **구독 기간**: 1년 (2025년 12월까지)
- **식물 레벨**: 3 (성숙한 나무)
- **일기 개수**: 3개 (테스트 데이터 포함)
- **업적 개수**: 2개 (첫 번째 일기, 일주일 연속)

## 프리미엄 계정 특징

### ✅ 광고 제거

- 메인 페이지 광고 배너 없음
- 일기 작성 시 광고 모달 없음
- 깔끔한 인터페이스

### ✅ 프리미엄 기능

- 무제한 통계 분석
- 모든 테마 사용 가능
- 클라우드 백업
- 데이터 내보내기

### ✅ 테스트 데이터

- 3개의 샘플 일기 (다양한 감정)
- 레벨 3 식물 (성숙한 나무)
- 2개의 달성 업적
- 연속 작성 기록

## 테스트 시나리오

### 1. 무료 사용자 경험

1. `test@example.com`으로 로그인
2. 메인 페이지에서 광고 배너 확인
3. 일기 작성 시 광고 모달 확인
4. 5초 대기 후 건너뛰기 버튼 활성화
5. 프리미엄 업그레이드 링크 확인

### 2. 프리미엄 사용자 경험

1. `premium-test@example.com`으로 로그인
2. 광고 배너 없음 확인
3. 일기 작성 시 광고 모달 없음 확인
4. 무제한 통계 분석 기능 확인
5. 기존 테스트 데이터 확인

## 수동으로 프리미엄 계정 만들기

### 방법 1: SQL 스크립트 실행

1. Supabase 대시보드 → SQL Editor로 이동
2. `create-premium-account.sql` 파일 내용을 복사하여 실행
3. 실행 결과에서 계정 생성 확인

### 방법 2: 단계별 수동 생성

```sql
-- 1. 사용자 생성
INSERT INTO users (email, name, email_verified, provider, created_at, updated_at)
VALUES ('premium-test@example.com', '프리미엄 테스터', true, 'credentials', NOW(), NOW());

-- 2. 프리미엄 구독 생성
INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email = 'premium-test@example.com'),
  'premium',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- 3. 테스트 식물 생성
INSERT INTO plants (user_id, type, level, experience, name, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email = 'premium-test@example.com'),
  'mature',
  3,
  250,
  '테스트 식물',
  NOW(),
  NOW()
);
```

## 현재 문제점

1. Supabase API 키 인증 오류
2. 데이터베이스 연결 설정 필요
3. 환경 변수 설정 (.env.local 파일)

## 해결 방법

1. Supabase 프로젝트 설정 확인
2. 환경 변수 설정 (.env.local 파일)
3. 데이터베이스 마이그레이션 실행
4. 수동으로 테스트 데이터 생성
