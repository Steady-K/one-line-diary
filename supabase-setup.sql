-- Supabase 데이터베이스 테이블 생성 SQL
-- 이 파일의 내용을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 일기 테이블
CREATE TABLE IF NOT EXISTS diaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion VARCHAR(10) NOT NULL,
  weather VARCHAR(10),
  mood INTEGER DEFAULT 5 CHECK (mood >= 1 AND mood <= 10),
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 구독 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 식물 테이블
CREATE TABLE IF NOT EXISTS plants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'seedling',
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 업적 테이블
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 7. Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 설정 (인증된 사용자만 자신의 데이터 접근 가능)
-- 사용자 테이블 정책
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- 일기 테이블 정책
CREATE POLICY "Users can view own diaries" ON diaries FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own diaries" ON diaries FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own diaries" ON diaries FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own diaries" ON diaries FOR DELETE USING (auth.uid()::text = user_id::text);

-- 구독 테이블 정책
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 식물 테이블 정책
CREATE POLICY "Users can view own plant" ON plants FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own plant" ON plants FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own plant" ON plants FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 업적 테이블 정책
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 9. 샘플 데이터 삽입 (테스트용)
-- 테스트 사용자
INSERT INTO users (email, name, email_verified, provider) VALUES 
('test@example.com', '테스트 사용자', true, 'credentials')
ON CONFLICT (email) DO NOTHING;

-- 테스트 일기
INSERT INTO diaries (user_id, content, emotion, weather, mood, is_private) 
SELECT 1, '오늘은 좋은 하루였어요!', '😊', '🌞', 8, false
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- 테스트 식물
INSERT INTO plants (user_id, type, level, experience, name) 
SELECT 1, 'seedling', 1, 0, '나의 첫 식물'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- 테스트 구독
INSERT INTO subscriptions (user_id, plan_type, status) 
SELECT 1, 'free', 'active'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- 테스트 업적
INSERT INTO achievements (user_id, type, title, description, icon) 
SELECT 1, 'first_diary', '첫 번째 일기', '첫 번째 일기를 작성했습니다!', '🎉'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
ON CONFLICT (user_id, type) DO NOTHING;
