-- 아임포트 관련 필드 추가
ALTER TABLE subscriptions 
ADD COLUMN imp_uid VARCHAR(255),
ADD COLUMN imp_merchant_uid VARCHAR(255);

-- 기존 토스페이먼츠 필드 제거 (선택사항)
-- ALTER TABLE subscriptions 
-- DROP COLUMN toss_order_id,
-- DROP COLUMN toss_payment_key;

-- 인덱스 추가
CREATE INDEX idx_subscriptions_imp_uid ON subscriptions(imp_uid);
CREATE INDEX idx_subscriptions_imp_merchant_uid ON subscriptions(imp_merchant_uid);
