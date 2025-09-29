-- subscriptions 테이블에 토스페이먼츠 필드 추가
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS toss_order_id TEXT,
ADD COLUMN IF NOT EXISTS toss_payment_key TEXT;

-- 기존 구독을 premium으로 업데이트 (테스트용)
UPDATE subscriptions 
SET 
  plan_type = 'premium',
  status = 'active',
  toss_order_id = 'test_order_' || id,
  toss_payment_key = 'test_payment_' || id,
  end_date = NOW() + INTERVAL '30 days'
WHERE user_id = 8; -- 현재 테스트 사용자 ID

-- 결과 확인
SELECT * FROM subscriptions WHERE user_id = 8;
