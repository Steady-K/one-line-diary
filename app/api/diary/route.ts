import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { dbService, diaryService } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, emotion, weather, mood, isPrivate } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 200) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const userEmail = session.user.email || undefined;

    // Supabase를 사용한 통합 일기 작성 처리
    const result = await dbService.processDiaryCreation(
      userId,
      {
        user_id: userId,
        content: content.trim(),
        emotion: emotion || "😊",
        weather: weather || "🌞",
        mood: mood || 5,
        is_private: isPrivate ?? true,
      },
      userEmail
    );

    if (!result.diary) {
      return NextResponse.json(
        { error: "Failed to create diary" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      diary: result.diary,
      plant: result.plant,
      newAchievements: result.newAchievements,
    });
  } catch (error) {
    console.error("일기 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create diary" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");
    const today = searchParams.get("today") === "true";
    const userId = parseInt(session.user.id);
    const userEmail = session.user.email || undefined;

    console.log("일기 목록 API 요청:", {
      userId,
      month,
      year,
      limit,
      today,
      currentDate: new Date().toISOString(),
    });

    // 오늘 일기 확인 요청인 경우
    if (today) {
      const todayDiary = await diaryService.getTodayDiary(userId, userEmail);
      console.log("오늘 일기 확인 결과:", todayDiary);
      console.log("todayDiary 타입:", typeof todayDiary);
      console.log("todayDiary 존재 여부:", !!todayDiary);

      // todayDiary가 존재하고 유효한 객체인지 확인
      if (todayDiary && typeof todayDiary === "object" && todayDiary.id) {
        console.log("오늘 일기 있음 - 응답 전송");
        const response = {
          hasTodayDiary: true,
          diary: {
            id: todayDiary.id,
            user_id: todayDiary.user_id,
            content: todayDiary.content,
            emotion: todayDiary.emotion,
            weather: todayDiary.weather,
            mood: todayDiary.mood,
            is_private: todayDiary.is_private,
            created_at: todayDiary.created_at,
            updated_at: todayDiary.updated_at,
          },
        };
        console.log("응답 데이터:", JSON.stringify(response, null, 2));
        return NextResponse.json(response);
      } else {
        console.log("오늘 일기 없음 - 응답 전송");
        const response = {
          hasTodayDiary: false,
          diary: null,
        };
        console.log("응답 데이터:", JSON.stringify(response, null, 2));
        return NextResponse.json(response);
      }
    }

    // 일반 월별 일기 목록 조회
    const diaries = await diaryService.getUserDiaries(
      userId,
      limit,
      userEmail,
      month,
      year
    );

    console.log("일기 목록 API 응답:", {
      userId,
      month,
      year,
      diaryCount: diaries.length,
      diaries: diaries.map((d) => ({
        id: d.id,
        created_at: d.created_at,
        content: d.content.substring(0, 20) + "...",
      })),
    });

    return NextResponse.json({ diaries });
  } catch (error) {
    console.error("일기 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch diaries" },
      { status: 500 }
    );
  }
}
