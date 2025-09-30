-- 토스페이먼츠 관련 필드 삭제
-- 아임포트로 완전히 변경되었으므로 토스페이먼츠 필드 제거

-- 토스페이먼츠 관련 컬럼 삭제
ALTER TABLE subscriptions 
DROP COLUMN IF EXISTS toss_order_id,
DROP COLUMN IF EXISTS toss_payment_key;

-- 토스페이먼츠 관련 인덱스 삭제 (있다면)
DROP INDEX IF EXISTS idx_subscriptions_toss_order_id;
DROP INDEX IF EXISTS idx_subscriptions_toss_payment_key;

-- 확인용 쿼리 (실행 후 삭제)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'subscriptions' 
-- ORDER BY ordinal_position;
