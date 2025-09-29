
-- users 테이블의 provider_id 컬럼을 bigint로 변경
ALTER TABLE users ALTER COLUMN provider_id TYPE bigint;

-- 변경 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'provider_id';

