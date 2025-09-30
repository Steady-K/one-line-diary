-- 테스트용 프리미엄 구독 생성 스크립트
-- 이 스크립트는 로컬 테스트용으로 사용됩니다.

-- 1. 테스트용 사용자 생성 (이미 있다면 건너뛰기)
INSERT OR IGNORE INTO users (email, name, created_at, updated_at)
VALUES (
  'test@example.com',
  '테스트 사용자',
  datetime('now'),
  datetime('now')
);

-- 2. 테스트용 프리미엄 구독 생성
INSERT OR IGNORE INTO subscriptions (
  user_id,
  plan_type,
  status,
  start_date,
  end_date,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'premium',
  'active',
  datetime('now'),
  datetime('now', '+30 days'),
  datetime('now'),
  datetime('now')
FROM users u
WHERE u.email = 'test@example.com';

-- 3. 결과 확인
SELECT 
  u.email,
  u.name,
  s.plan_type,
  s.status,
  s.start_date,
  s.end_date
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'test@example.com';
