-- 프리미엄 테스트 계정 생성 SQL 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 사용자 생성 (이미 있다면 생략)
INSERT INTO users (email, name, email_verified, provider, created_at, updated_at)
VALUES ('premium-test@example.com', '프리미엄 테스터', true, 'credentials', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

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
)
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'premium',
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();

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
)
ON CONFLICT (user_id) DO UPDATE SET
  type = 'mature',
  level = 3,
  experience = 250,
  name = '테스트 식물',
  updated_at = NOW();

-- 4. 테스트 일기 생성
INSERT INTO diaries (user_id, content, emotion, mood, weather, is_private, created_at, updated_at)
VALUES 
  (
    (SELECT id FROM users WHERE email = 'premium-test@example.com'),
    '프리미엄 테스트 계정으로 작성한 첫 번째 일기입니다!',
    '😊',
    8,
    '🌞',
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'premium-test@example.com'),
    '광고 없이 깔끔하게 일기를 작성할 수 있어서 좋아요!',
    '😍',
    9,
    '⛅',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM users WHERE email = 'premium-test@example.com'),
    '오늘도 프리미엄 기능을 만끽하며 일기를 작성합니다.',
    '😎',
    7,
    '🌧️',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 5. 테스트 업적 생성
INSERT INTO achievements (user_id, type, title, description, icon, unlocked_at)
VALUES 
  (
    (SELECT id FROM users WHERE email = 'premium-test@example.com'),
    'first_diary',
    '첫 번째 일기',
    '첫 번째 일기를 작성했습니다!',
    '🎉',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'premium-test@example.com'),
    'week_streak',
    '일주일 연속',
    '7일 연속으로 일기를 작성했습니다!',
    '🔥',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (user_id, type) DO NOTHING;

-- 6. 생성 결과 확인
SELECT 
  u.email,
  u.name,
  s.plan_type,
  s.status,
  s.end_date,
  p.level,
  p.type,
  p.name as plant_name,
  (SELECT COUNT(*) FROM diaries WHERE user_id = u.id) as diary_count,
  (SELECT COUNT(*) FROM achievements WHERE user_id = u.id) as achievement_count
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN plants p ON u.id = p.user_id
WHERE u.email = 'premium-test@example.com';
