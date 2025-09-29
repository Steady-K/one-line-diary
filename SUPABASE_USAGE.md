# Supabase 사용법 가이드

## 🎯 완성된 기능들

`lib/supabase.ts` 파일에 모든 데이터베이스 기능이 구현되어 있습니다!

### 📋 사용 가능한 서비스들

1. **`userService`** - 사용자 관리
2. **`diaryService`** - 일기 관리
3. **`plantService`** - 식물 성장 시스템
4. **`subscriptionService`** - 구독 관리
5. **`achievementService`** - 업적 시스템
6. **`dbService`** - 통합 서비스

---

## 🚀 사용 예시

### 1. 새 사용자 등록

```typescript
import { dbService } from "@/lib/supabase";

// 회원가입 시 사용자 초기화
const result = await dbService.initializeNewUser({
  email: "user@example.com",
  name: "사용자 이름",
  provider: "credentials",
  password_hash: "hashed_password",
});

console.log("사용자:", result.user);
console.log("식물:", result.plant);
console.log("구독:", result.subscription);
```

### 2. 일기 작성

```typescript
import { dbService } from "@/lib/supabase";

// 일기 작성 (자동으로 경험치 추가, 업적 체크)
const result = await dbService.processDiaryCreation(userId, {
  user_id: userId,
  content: "오늘은 좋은 하루였어요!",
  emotion: "😊",
  weather: "🌞",
  mood: 8,
  is_private: false,
});

console.log("일기:", result.diary);
console.log("식물:", result.plant);
console.log("새 업적:", result.newAchievements);
```

### 3. 식물 정보 조회

```typescript
import { plantService } from "@/lib/supabase";

// 사용자 식물 정보 조회
const plant = await plantService.getUserPlant(userId);
console.log("식물 레벨:", plant?.level);
console.log("식물 타입:", plant?.type);
console.log("경험치:", plant?.experience);

// 식물 이름 변경
await plantService.updatePlantName(userId, "나의 소중한 식물");
```

### 4. 일기 목록 조회

```typescript
import { diaryService } from "@/lib/supabase";

// 사용자의 일기 목록 조회
const diaries = await diaryService.getUserDiaries(userId, 20);

diaries.forEach((diary) => {
  console.log(`${diary.emotion} ${diary.content}`);
  console.log(`날씨: ${diary.weather}, 기분: ${diary.mood}/10`);
  console.log(`작성일: ${diary.created_at}`);
});
```

### 5. 업적 조회

```typescript
import { achievementService } from "@/lib/supabase";

// 사용자 업적 목록 조회
const achievements = await achievementService.getUserAchievements(userId);

achievements.forEach((achievement) => {
  console.log(`${achievement.icon} ${achievement.title}`);
  console.log(achievement.description);
});
```

### 6. 구독 정보 관리

```typescript
import { subscriptionService } from "@/lib/supabase";

// 구독 정보 조회
const subscription = await subscriptionService.getUserSubscription(userId);

// 프리미엄으로 업그레이드
await subscriptionService.updateSubscription(userId, {
  plan_type: "premium",
  status: "active",
});
```

---

## 🔧 API 라우트에서 사용

### 일기 생성 API (POST /api/diary)

```typescript
// app/api/diary/route.ts
import { dbService } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { content, emotion, weather, mood } = await request.json();

  const result = await dbService.processDiaryCreation(userId, {
    user_id: userId,
    content,
    emotion,
    weather,
    mood,
    is_private: false,
  });

  return NextResponse.json({
    success: true,
    diary: result.diary,
    plant: result.plant,
    newAchievements: result.newAchievements,
  });
}
```

### 식물 정보 API (GET /api/plant)

```typescript
// app/api/plant/route.ts
import { plantService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const plant = await plantService.getUserPlant(userId);
  return NextResponse.json({ plant });
}
```

---

## 🎮 프론트엔드에서 사용

### React 컴포넌트에서

```typescript
// components/DiaryForm.tsx
import { dbService } from '@/lib/supabase';

export default function DiaryForm() {
  const handleSubmit = async (formData) => {
    const result = await dbService.processDiaryCreation(userId, {
      user_id: userId,
      content: formData.content,
      emotion: formData.emotion,
      weather: formData.weather,
      mood: formData.mood,
      is_private: formData.isPrivate
    });

    if (result.diary) {
      alert('일기가 작성되었습니다!');

      // 새 업적이 있으면 표시
      if (result.newAchievements.length > 0) {
        result.newAchievements.forEach(achievement => {
          alert(`새 업적 획득: ${achievement.icon} ${achievement.title}`);
        });
      }
    }
  };

  return (
    // 폼 JSX
  );
}
```

---

## 🗄️ 데이터베이스 테이블 구조

### users 테이블

- `id` - 사용자 ID (자동 증가)
- `email` - 이메일 (유니크)
- `password_hash` - 비밀번호 해시
- `name` - 사용자 이름
- `email_verified` - 이메일 인증 여부
- `provider` - 로그인 제공자
- `created_at`, `updated_at` - 생성/수정 시간

### diaries 테이블

- `id` - 일기 ID (자동 증가)
- `user_id` - 사용자 ID (외래키)
- `content` - 일기 내용
- `emotion` - 감정 태그 (이모지)
- `weather` - 날씨 태그
- `mood` - 기분 점수 (1-10)
- `is_private` - 비공개 여부
- `created_at`, `updated_at` - 생성/수정 시간

### plants 테이블

- `id` - 식물 ID (자동 증가)
- `user_id` - 사용자 ID (외래키, 유니크)
- `type` - 식물 단계 (seedling, sprout, young, mature, flowering, fruiting)
- `level` - 레벨
- `experience` - 경험치
- `name` - 식물 이름
- `created_at`, `updated_at` - 생성/수정 시간

### subscriptions 테이블

- `id` - 구독 ID (자동 증가)
- `user_id` - 사용자 ID (외래키, 유니크)
- `plan_type` - 구독 타입 (free, premium)
- `status` - 구독 상태 (active, cancelled, expired)
- `stripe_customer_id` - Stripe 고객 ID
- `stripe_subscription_id` - Stripe 구독 ID
- `start_date`, `end_date` - 구독 시작/종료 날짜

### achievements 테이블

- `id` - 업적 ID (자동 증가)
- `user_id` - 사용자 ID (외래키)
- `type` - 업적 타입 (first_diary, week_streak, month_streak 등)
- `title` - 업적 제목
- `description` - 업적 설명
- `icon` - 업적 아이콘
- `unlocked_at` - 업적 획득 시간

---

## 🎉 완성!

이제 Supabase를 사용해서 완전한 한줄 일기 애플리케이션을 만들 수 있습니다!

### 주요 기능들:

- ✅ 사용자 등록 및 인증
- ✅ 일기 작성, 조회, 수정, 삭제
- ✅ 식물 성장 시스템 (경험치, 레벨업)
- ✅ 업적 시스템
- ✅ 구독 관리
- ✅ 실시간 데이터 동기화

모든 함수가 타입 안전하게 구현되어 있고, 에러 처리도 포함되어 있습니다.
