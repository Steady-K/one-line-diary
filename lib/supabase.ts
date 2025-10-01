import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트 정보
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://iiqubthhdbecrxrwxosx.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXVidGhocGRiZWNyeHJ3eG9zeCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU5MDg0Njk0LCJleHAiOjIwNzQ2NjA2OTR9.bFrO4WB3UTIJmwtMymw9S3fEqqNDZ22v-8f5nndkI-A";

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 서버사이드용 Supabase 클라이언트 (관리자 권한)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// 타입 정의 (기존 Prisma 모델 기반)
export interface User {
  id: number;
  email: string;
  password_hash?: string;
  name?: string;
  nickname?: string;
  gender?: string;
  birth_date?: string;
  email_verified: boolean;
  verification_token?: string;
  provider?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Diary {
  id: number;
  user_id: number;
  content: string;
  emotion: string;
  weather?: string;
  mood: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  imp_uid?: string;
  imp_merchant_uid?: string;
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: number;
  user_id: number;
  type: string;
  level: number;
  experience: number;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: number;
  user_id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

// ===== 데이터베이스 유틸리티 함수들 =====

// 사용자 관련 함수
export const userService = {
  // 사용자 생성
  async createUser(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("사용자 생성 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 조회 (이메일로)
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("사용자 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 조회 (ID로) - 문자열 또는 숫자 모두 처리
  async getUserById(
    userId: string | number,
    userEmail?: string
  ): Promise<User | null> {
    const idString = userId.toString();
    const id = parseInt(idString);

    // 숫자가 너무 크면 이메일로 조회
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return null;
      }
      return await this.getUserByEmail(userEmail);
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("사용자 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 프로필 조회
  async getUserProfile(
    userId: string | number,
    userEmail?: string
  ): Promise<User | null> {
    return await this.getUserById(userId, userEmail);
  },

  // 사용자 프로필 생성
  async createUserProfile(
    userId: string | number,
    userEmail: string,
    profileData: {
      name: string;
      gender: string;
      birth_date: string;
    }
  ): Promise<User | null> {
    const user = await this.getUserById(userId, userEmail);
    if (!user) {
      console.error("사용자를 찾을 수 없습니다:", userEmail);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        name: profileData.name,
        gender: profileData.gender,
        birth_date: profileData.birth_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("프로필 생성 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 프로필 수정
  async updateUserProfile(
    userId: string | number,
    userEmail: string,
    profileData: {
      name: string;
      gender: string;
      birth_date: string;
    }
  ): Promise<User | null> {
    const user = await this.getUserById(userId, userEmail);
    if (!user) {
      console.error("사용자를 찾을 수 없습니다:", userEmail);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        name: profileData.name,
        gender: profileData.gender,
        birth_date: profileData.birth_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("프로필 수정 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 정보 업데이트
  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("사용자 업데이트 오류:", error);
      return null;
    }
    return data;
  },
};

// 일기 관련 함수
export const diaryService = {
  // 일기 생성
  async createDiary(
    diaryData: Omit<Diary, "id" | "created_at" | "updated_at">
  ): Promise<Diary | null> {
    console.log("일기 생성 데이터:", diaryData);

    const { data, error } = await supabase
      .from("diaries")
      .insert([diaryData])
      .select()
      .single();

    if (error) {
      console.error("일기 생성 오류:", error);
      return null;
    }

    console.log("일기 생성 성공:", data);
    return data;
  },

  // 사용자의 일기 목록 조회
  async getUserDiaries(
    userId: number,
    limit: number = 50,
    userEmail?: string,
    month?: number,
    year?: number
  ): Promise<Diary[]> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return [];
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return [];
      }
      actualUserId = user.id;
    }

    let query = supabase
      .from("diaries")
      .select("*")
      .eq("user_id", actualUserId);

    // 월별 필터링 추가
    if (month && year) {
      console.log("월별 필터링 요청:", { month, year });
      
      // 가장 안전한 방법: 월 범위를 넓게 설정하고 클라이언트에서 필터링
      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;
      
      // 월 범위를 넓게 설정 (전달 25일 ~ 다음달 5일)
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      
      query = query
        .gte('created_at', `${prevYear}-${prevMonth.toString().padStart(2, "0")}-25T00:00:00`)
        .lt('created_at', `${nextYear}-${nextMonth.toString().padStart(2, "0")}-05T23:59:59`);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("일기 조회 오류:", error);
      return [];
    }

    // 디버깅을 위해 실제 데이터 확인
    if (data && data.length > 0) {
      console.log("조회된 일기 데이터 샘플:", data.slice(0, 3).map(d => ({
        id: d.id,
        created_at: d.created_at,
        content: d.content.substring(0, 20) + "..."
      })));
    }

    // 클라이언트 사이드에서 정확한 월별 필터링
    let filteredData = data || [];
    if (month && year && data) {
      filteredData = data.filter(diary => {
        const diaryDate = new Date(diary.created_at);
        const diaryYear = diaryDate.getFullYear();
        const diaryMonth = diaryDate.getMonth() + 1; // getMonth()는 0부터 시작
        
        console.log("필터링 체크:", {
          diaryDate: diary.created_at,
          diaryYear,
          diaryMonth,
          targetYear: year,
          targetMonth: month,
          match: diaryYear === year && diaryMonth === month
        });
        
        return diaryYear === year && diaryMonth === month;
      });
      
      console.log(`월별 필터링 결과: ${data.length}개 중 ${filteredData.length}개 선택`);
    }

    return filteredData;
  },

  // 특정 일기 조회
  async getDiaryById(id: number): Promise<Diary | null> {
    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("일기 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 일기 업데이트
  async updateDiary(
    id: number,
    updates: Partial<Diary>,
    userId: number,
    userEmail?: string
  ): Promise<Diary | null> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const idNum = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = idNum;
    if (isNaN(idNum) || idNum > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return null;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return null;
      }
      actualUserId = user.id;
    }

    const { data, error } = await supabase
      .from("diaries")
      .update(updates)
      .eq("id", id)
      .eq("user_id", actualUserId)
      .select()
      .single();

    if (error) {
      console.error("일기 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // 일기 삭제
  async deleteDiary(
    id: number,
    userId: number,
    userEmail?: string
  ): Promise<boolean> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const idNum = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = idNum;
    if (isNaN(idNum) || idNum > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return false;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return false;
      }
      actualUserId = user.id;
    }

    const { error } = await supabase
      .from("diaries")
      .delete()
      .eq("id", id)
      .eq("user_id", actualUserId);

    if (error) {
      console.error("일기 삭제 오류:", error);
      return false;
    }
    return true;
  },

  // 사용자 통계 조회
  async getUserStats(
    userId: string | number,
    month: number,
    year: number,
    userEmail?: string
  ): Promise<{
    emotionStats: Record<string, number>;
    moodStats: {
      average: number;
      min: number;
      max: number;
    };
    dailyMood: Array<{
      date: string;
      mood: number;
      emotion: string;
    }>;
    streak: number;
    totalEntries: number;
    monthEntries: number;
  }> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return {
          emotionStats: {},
          moodStats: { average: 0, min: 0, max: 0 },
          dailyMood: [],
          streak: 0,
          totalEntries: 0,
          monthEntries: 0,
        };
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return {
          emotionStats: {},
          moodStats: { average: 0, min: 0, max: 0 },
          dailyMood: [],
          streak: 0,
          totalEntries: 0,
          monthEntries: 0,
        };
      }
      actualUserId = user.id;
    }

    // 월별 필터링 - 넓은 범위로 조회 후 클라이언트에서 필터링
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    console.log("통계 월별 필터링:", { month, year, prevMonth, prevYear, nextMonth, nextYear });

    // 해당 월의 모든 일기 가져오기 (넓은 범위로 조회)
    const { data: allDiaries, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("user_id", actualUserId)
      .gte("created_at", `${prevYear}-${prevMonth.toString().padStart(2, "0")}-25T00:00:00`)
      .lt("created_at", `${nextYear}-${nextMonth.toString().padStart(2, "0")}-05T23:59:59`)
      .order("created_at", { ascending: true });

    // 클라이언트 사이드에서 정확한 월별 필터링
    const diaries = allDiaries?.filter(diary => {
      const diaryDate = new Date(diary.created_at);
      const diaryYear = diaryDate.getFullYear();
      const diaryMonth = diaryDate.getMonth() + 1;
      return diaryYear === year && diaryMonth === month;
    }) || [];

    if (error) {
      console.error("일기 조회 오류:", error);
      return {
        emotionStats: {},
        moodStats: { average: 0, min: 0, max: 0 },
        dailyMood: [],
        streak: 0,
        totalEntries: 0,
        monthEntries: 0,
      };
    }

    const diaryList = diaries || [];

    // 감정별 통계
    const emotionStats = diaryList.reduce((acc, diary) => {
      acc[diary.emotion] = (acc[diary.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 기분 점수 통계
    const moodStats = {
      average:
        diaryList.length > 0
          ? diaryList.reduce((sum, diary) => sum + diary.mood, 0) /
            diaryList.length
          : 0,
      min: diaryList.length > 0 ? Math.min(...diaryList.map((d) => d.mood)) : 0,
      max: diaryList.length > 0 ? Math.max(...diaryList.map((d) => d.mood)) : 0,
    };

    // 일별 기분 점수 (차트용)
    const dailyMood = diaryList.map((diary) => ({
      date: diary.created_at.split("T")[0],
      mood: diary.mood,
      emotion: diary.emotion,
    }));

    // 연속 작성 일수 계산 (간단한 구현)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasEntry = diaryList.some((diary) => {
        const diaryDate = new Date(diary.created_at);
        return diaryDate >= dayStart && diaryDate < dayEnd;
      });

      if (!hasEntry) break;
      streak++;
    }

    // 총 통계
    const { count: totalEntries } = await supabase
      .from("diaries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", actualUserId);

    return {
      emotionStats,
      moodStats: {
        ...moodStats,
        average: Math.round(moodStats.average * 10) / 10,
      },
      dailyMood,
      streak,
      totalEntries: totalEntries || 0,
      monthEntries: diaryList.length,
    };
  },
};

// 식물 관련 함수
export const plantService = {
  // 사용자 식물 조회
  async getUserPlant(userId: number): Promise<Plant | null> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("식물 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 식물 생성 (새 사용자용)
  async createPlant(
    plantData: Omit<Plant, "id" | "created_at" | "updated_at">
  ): Promise<Plant | null> {
    const { data, error } = await supabase
      .from("plants")
      .insert([plantData])
      .select()
      .single();

    if (error) {
      console.error("식물 생성 오류:", error);
      return null;
    }
    return data;
  },

  // 식물 경험치 추가 및 레벨업 처리
  async addExperience(userId: number, exp: number): Promise<Plant | null> {
    const plant = await this.getUserPlant(userId);
    if (!plant) return null;

    const newExperience = plant.experience + exp;
    let newLevel = plant.level;
    let newType = plant.type;

    // 레벨업 체크 (간단한 로직: 100 경험치당 1레벨)
    const levelUpExp = newLevel * 100;
    if (newExperience >= levelUpExp) {
      newLevel += Math.floor(newExperience / 100) - (newLevel - 1);

      // 타입 변경 로직
      if (newLevel >= 5) newType = "fruiting";
      else if (newLevel >= 4) newType = "flowering";
      else if (newLevel >= 3) newType = "mature";
      else if (newLevel >= 2) newType = "young";
      else if (newLevel >= 1) newType = "sprout";
      else newType = "seedling";
    }

    const { data, error } = await supabase
      .from("plants")
      .update({
        experience: newExperience,
        level: newLevel,
        type: newType,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("식물 경험치 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // 식물 이름 변경
  async updatePlantName(userId: number, name: string): Promise<Plant | null> {
    const { data, error } = await supabase
      .from("plants")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("식물 이름 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // 사용자 식물 조회 또는 생성
  async getOrCreateUserPlant(
    userId: string | number,
    userEmail?: string
  ): Promise<Plant | null> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return null;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return null;
      }
      actualUserId = user.id;
    }

    let plant = await this.getUserPlant(actualUserId);

    if (!plant) {
      plant = await this.createPlant({
        user_id: actualUserId,
        type: "seedling",
        level: 1,
        experience: 0,
      });
    }

    return plant;
  },

  // 경험치 추가 및 레벨업 처리 (이름 포함) - 중복 제거
  async addExperienceWithName(
    userId: string | number,
    exp: number,
    name?: string,
    userEmail?: string
  ): Promise<{ plant: Plant | null; leveledUp: boolean }> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return { plant: null, leveledUp: false };
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return { plant: null, leveledUp: false };
      }
      actualUserId = user.id;
    }

    const plant = await this.getUserPlant(actualUserId);
    if (!plant) return { plant: null, leveledUp: false };

    const oldLevel = plant.level;
    let newExperience = plant.experience + exp;
    let newLevel = plant.level;
    let newType = plant.type;

    // 새로운 7단계 식물 등급 시스템
    const plantStages = [
      { level: 1, type: "seedling", exp: 10 }, // 씨앗
      { level: 2, type: "sprout", exp: 20 }, // 새싹
      { level: 3, type: "stem", exp: 40 }, // 줄기
      { level: 4, type: "leaves", exp: 80 }, // 잎파리
      { level: 5, type: "tree", exp: 160 }, // 나무
      { level: 6, type: "flower", exp: 320 }, // 꽃
      { level: 7, type: "fruit", exp: 640 }, // 열매
    ];

    // 레벨업 체크 - 현재 레벨의 필요 경험치와 비교
    const currentStage = plantStages.find((stage) => stage.level === newLevel);
    if (currentStage && newExperience >= currentStage.exp) {
      // 다음 레벨로 업그레이드
      const nextStage = plantStages.find(
        (stage) => stage.level === newLevel + 1
      );
      if (nextStage) {
        newLevel = nextStage.level;
        newType = nextStage.type;
        // 레벨업 시 경험치를 0으로 초기화
        newExperience = 0;
      } else {
        // 최대 레벨 도달
        newLevel = plantStages[plantStages.length - 1].level;
        newType = plantStages[plantStages.length - 1].type;
        newExperience = 0;
      }
    }

    const { data, error } = await supabase
      .from("plants")
      .update({
        experience: newExperience,
        level: newLevel,
        type: newType,
        name: name || plant.name,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", actualUserId)
      .select()
      .single();

    if (error) {
      console.error("식물 경험치 업데이트 오류:", error);
      return { plant: null, leveledUp: false };
    }

    return { plant: data, leveledUp: newLevel > oldLevel };
  },
};

// 구독 관련 함수
export const subscriptionService = {
  // 사용자 구독 정보 조회
  async getUserSubscription(userId: number): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("구독 정보 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 구독 생성 (새 사용자용)
  async createSubscription(
    subscriptionData: Omit<Subscription, "id" | "created_at" | "updated_at">
  ): Promise<Subscription | null> {
    console.log("구독 생성 시도:", subscriptionData);

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error("구독 생성 오류:", error);
      console.error("구독 데이터:", subscriptionData);
      return null;
    }

    console.log("구독 생성 성공:", data);
    return data;
  },

  // 구독 업데이트 (ID로)
  async updateSubscription(
    subscriptionId: number,
    updates: Partial<Subscription>
  ): Promise<Subscription | null> {
    console.log("구독 업데이트 시도:", { subscriptionId, updates });

    const { data, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("구독 업데이트 오류:", error);
      console.error("구독 ID:", subscriptionId);
      console.error("업데이트 데이터:", updates);
      return null;
    }

    console.log("구독 업데이트 성공:", data);
    return data;
  },

  // 사용자 ID로 구독 업데이트
  async updateSubscriptionByUserId(
    userId: number,
    updates: Partial<Subscription>
  ): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("사용자 ID로 구독 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // Stripe ID로 구독 업데이트
  async updateSubscriptionByStripeId(
    stripeSubscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Stripe ID로 구독 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // 아임포트 주문 ID로 구독 업데이트
  async updateSubscriptionByImpMerchantUid(
    impMerchantUid: string,
    updates: Partial<Subscription>
  ): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("imp_merchant_uid", impMerchantUid)
      .select()
      .single();

    if (error) {
      console.error("아임포트 주문 ID로 구독 업데이트 오류:", error);
      return null;
    }
    return data;
  },

  // 활성 구독 조회
  async getActiveSubscription(
    userId: string | number,
    userEmail?: string
  ): Promise<Subscription | null> {
    console.log("활성 구독 조회 시도:", { userId, userEmail });

    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return null;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return null;
      }
      actualUserId = user.id;
      console.log("이메일로 사용자 조회 성공:", actualUserId);
    }

    console.log("실제 사용자 ID로 구독 조회:", actualUserId);

    // 먼저 active 상태의 구독을 찾음
    const { data, error: queryError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", actualUserId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (queryError) {
      console.error("활성 구독 조회 오류:", queryError);
      console.error("조회 조건:", { user_id: actualUserId, status: "active" });
      return null;
    }

    // active 구독이 없으면 null 반환 (취소된 구독은 반환하지 않음)
    if (!data || data.length === 0) {
      console.log("활성 구독이 없음");
      return null;
    } else {
      console.log("구독 조회 성공:", data[0]);
      return data[0];
    }
  },
};

// 업적 관련 함수
export const achievementService = {
  // 사용자 업적 목록 조회
  async getUserAchievements(
    userId: number,
    userEmail?: string
  ): Promise<Achievement[]> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return [];
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return [];
      }
      actualUserId = user.id;
    }

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", actualUserId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("업적 조회 오류:", error);
      return [];
    }
    return data || [];
  },

  // 업적 생성
  async createAchievement(
    achievementData: Omit<Achievement, "id" | "unlocked_at">
  ): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from("achievements")
      .insert([achievementData])
      .select()
      .single();

    if (error) {
      console.error("업적 생성 오류:", error);
      return null;
    }
    return data;
  },

  // 특정 업적 타입이 이미 있는지 확인
  async hasAchievement(
    userId: number,
    type: string,
    userEmail?: string
  ): Promise<boolean> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return false;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return false;
      }
      actualUserId = user.id;
    }

    const { data, error } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", actualUserId)
      .eq("type", type)
      .single();

    return !error && data !== null;
  },

  // 특정 타입의 업적 조회
  async getUserAchievementByType(
    userId: string | number,
    type: string,
    userEmail?: string
  ): Promise<Achievement | null> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return null;
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return null;
      }
      actualUserId = user.id;
    }

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", actualUserId)
      .eq("type", type)
      .single();

    if (error) {
      console.error("업적 조회 오류:", error);
      return null;
    }
    return data;
  },

  // 업적 진행률 계산
  async getAchievementProgress(
    userId: string | number,
    userEmail?: string
  ): Promise<Record<string, number>> {
    // NextAuth에서 오는 큰 숫자 ID를 처리
    const idString = userId.toString();
    const id = parseInt(idString);

    // 큰 ID인 경우 이메일로 사용자 조회
    let actualUserId = id;
    if (isNaN(id) || id > 2147483647) {
      if (!userEmail) {
        console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
        return {};
      }
      const user = await userService.getUserByEmail(userEmail);
      if (!user) {
        console.error("사용자를 찾을 수 없습니다:", userEmail);
        return {};
      }
      actualUserId = user.id;
    }

    try {
      // 사용자의 일기 데이터 조회
      const { data: diaries, error: diaryError } = await supabase
        .from("diaries")
        .select("created_at, emotion")
        .eq("user_id", actualUserId)
        .order("created_at", { ascending: true });

      if (diaryError) {
        console.error("일기 조회 오류:", diaryError);
        return {};
      }

      // 사용자의 식물 데이터 조회
      const { data: plant, error: plantError } = await supabase
        .from("plants")
        .select("level, type")
        .eq("user_id", actualUserId)
        .single();

      if (plantError) {
        console.error("식물 조회 오류:", plantError);
      }

      const progress: Record<string, number> = {};

      // 첫 번째 일기 업적
      progress.first_diary = diaries && diaries.length > 0 ? 100 : 0;

      // 연속 일기 작성 업적 (최근 30일 기준)
      if (diaries && diaries.length > 0) {
        const today = new Date();
        const thirtyDaysAgo = new Date(
          today.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        // 최근 30일의 일기들
        const recentDiaries = diaries.filter(
          (diary) => new Date(diary.created_at) >= thirtyDaysAgo
        );

        // 연속 일수 계산
        let consecutiveDays = 0;
        const currentDate = new Date(today);

        for (let i = 0; i < 30; i++) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const hasDiary = recentDiaries.some((diary) =>
            diary.created_at.startsWith(dateStr)
          );

          if (hasDiary) {
            consecutiveDays++;
          } else {
            break;
          }

          currentDate.setDate(currentDate.getDate() - 1);
        }

        // 일주일 연속 (7일)
        progress.week_streak = Math.min((consecutiveDays / 7) * 100, 100);

        // 한 달 연속 (30일)
        progress.month_streak = Math.min((consecutiveDays / 30) * 100, 100);
      } else {
        progress.week_streak = 0;
        progress.month_streak = 0;
      }

      // 감정 마스터 업적 (9가지 감정 모두 사용)
      if (diaries && diaries.length > 0) {
        const uniqueEmotions = new Set(diaries.map((diary) => diary.emotion));
        const totalEmotions = 9; // 😊, 😠, 😢, 😴, 😮, 🤔, 😍, 😎, 😅
        progress.emotion_master = Math.min(
          (uniqueEmotions.size / totalEmotions) * 100,
          100
        );
      } else {
        progress.emotion_master = 0;
      }

      // 식물 키우기 업적
      if (plant) {
        // 식물 레벨에 따른 진행률 (최대 5레벨)
        progress.plant_grower = Math.min((plant.level / 5) * 100, 100);
      } else {
        progress.plant_grower = 0;
      }

      return progress;
    } catch (error) {
      console.error("업적 진행률 계산 오류:", error);
      return {};
    }
  },
};

// 통합 서비스 함수들
export const dbService = {
  // 새 사용자 초기화 (회원가입 시)
  async initializeNewUser(userData: {
    email: string;
    password_hash?: string;
    name?: string;
    provider?: string;
    provider_id?: string;
  }): Promise<{
    user: User | null;
    plant: Plant | null;
    subscription: Subscription | null;
  }> {
    try {
      // 1. 사용자 생성
      const user = await userService.createUser({
        ...userData,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!user) {
        return { user: null, plant: null, subscription: null };
      }

      // 2. 기본 식물 생성
      const plant = await plantService.createPlant({
        user_id: user.id,
        type: "seedling",
        level: 1,
        experience: 0,
      });

      // 3. 기본 구독 생성 (무료)
      const subscription = await subscriptionService.createSubscription({
        user_id: user.id,
        plan_type: "free",
        status: "active",
        start_date: new Date().toISOString(),
      });

      return { user, plant, subscription };
    } catch (error) {
      console.error("사용자 초기화 오류:", error);
      return { user: null, plant: null, subscription: null };
    }
  },

  // 일기 작성 시 처리 (경험치 추가, 업적 체크)
  async processDiaryCreation(
    userId: number,
    diaryData: Omit<Diary, "id" | "created_at" | "updated_at">,
    userEmail?: string
  ): Promise<{
    diary: Diary | null;
    plant: Plant | null;
    newAchievements: Achievement[];
  }> {
    try {
      console.log("processDiaryCreation 시작:", { userId, diaryData });

      // NextAuth에서 오는 큰 숫자 ID를 처리
      const idString = userId.toString();
      const id = parseInt(idString);

      // 큰 ID인 경우 이메일로 사용자 조회
      let actualUserId = id;
      if (isNaN(id) || id > 2147483647) {
        if (!userEmail) {
          console.error("큰 ID인데 이메일이 제공되지 않음:", userId);
          return { diary: null, plant: null, newAchievements: [] };
        }
        const user = await userService.getUserByEmail(userEmail);
        if (!user) {
          console.error("사용자를 찾을 수 없습니다:", userEmail);
          return { diary: null, plant: null, newAchievements: [] };
        }
        actualUserId = user.id;
        // diaryData의 user_id도 업데이트
        diaryData.user_id = actualUserId;
      }

      // 1. 일기 생성
      const diary = await diaryService.createDiary(diaryData);
      if (!diary) {
        console.error("일기 생성 실패");
        return { diary: null, plant: null, newAchievements: [] };
      }

      console.log("일기 생성 완료:", diary);

      // 2. 경험치 추가
      const plantResult = await plantService.addExperienceWithName(
        actualUserId,
        2,
        undefined,
        userEmail
      ); // 일기 작성당 2 경험치

      // 3. 업적 체크
      const newAchievements: Achievement[] = [];

      // 업적 진행률 계산
      const progress = await achievementService.getAchievementProgress(
        actualUserId,
        userEmail
      );

      // 첫 번째 일기 업적
      if (
        progress.first_diary === 100 &&
        !(await achievementService.hasAchievement(
          actualUserId,
          "first_diary",
          userEmail
        ))
      ) {
        const firstDiaryAchievement =
          await achievementService.createAchievement({
            user_id: actualUserId,
            type: "first_diary",
            title: "첫 번째 일기",
            description: "첫 번째 일기를 작성했습니다!",
            icon: "🎉",
          });
        if (firstDiaryAchievement) newAchievements.push(firstDiaryAchievement);
      }

      // 일주일 연속 업적
      if (
        progress.week_streak === 100 &&
        !(await achievementService.hasAchievement(
          actualUserId,
          "week_streak",
          userEmail
        ))
      ) {
        const weekStreakAchievement =
          await achievementService.createAchievement({
            user_id: actualUserId,
            type: "week_streak",
            title: "일주일 연속",
            description: "7일 연속으로 일기를 작성했습니다!",
            icon: "🔥",
          });
        if (weekStreakAchievement) newAchievements.push(weekStreakAchievement);
      }

      // 한 달 연속 업적
      if (
        progress.month_streak === 100 &&
        !(await achievementService.hasAchievement(
          actualUserId,
          "month_streak",
          userEmail
        ))
      ) {
        const monthStreakAchievement =
          await achievementService.createAchievement({
            user_id: actualUserId,
            type: "month_streak",
            title: "한 달 연속",
            description: "30일 연속으로 일기를 작성했습니다!",
            icon: "🏆",
          });
        if (monthStreakAchievement)
          newAchievements.push(monthStreakAchievement);
      }

      // 감정 마스터 업적
      if (
        progress.emotion_master === 100 &&
        !(await achievementService.hasAchievement(
          actualUserId,
          "emotion_master",
          userEmail
        ))
      ) {
        const emotionMasterAchievement =
          await achievementService.createAchievement({
            user_id: actualUserId,
            type: "emotion_master",
            title: "감정 마스터",
            description: "모든 감정을 사용해보았습니다!",
            icon: "😊",
          });
        if (emotionMasterAchievement)
          newAchievements.push(emotionMasterAchievement);
      }

      // 식물 키우기 업적 (레벨 5 달성)
      if (
        progress.plant_grower === 100 &&
        !(await achievementService.hasAchievement(
          actualUserId,
          "plant_grower",
          userEmail
        ))
      ) {
        const plantGrowerAchievement =
          await achievementService.createAchievement({
            user_id: actualUserId,
            type: "plant_grower",
            title: "식물 키우기",
            description: "식물을 최고 레벨까지 키웠습니다!",
            icon: "/characters/lala-happy.png",
          });
        if (plantGrowerAchievement)
          newAchievements.push(plantGrowerAchievement);
      }

      return { diary, plant: plantResult.plant, newAchievements };
    } catch (error) {
      console.error("일기 작성 처리 오류:", error);
      return { diary: null, plant: null, newAchievements: [] };
    }
  },
};
