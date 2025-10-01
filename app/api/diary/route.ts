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
    const date = searchParams.get("date"); // 클라이언트에서 전달받은 날짜 (YYYY-MM-DD)
    const userId = parseInt(session.user.id);
    const userEmail = session.user.email || undefined;

    console.log("일기 목록 API 요청:", {
      userId,
      month,
      year,
      limit,
      today,
      date,
      currentDate: new Date().toISOString(),
    });

    // 오늘 일기 확인 요청인 경우
    if (today) {
      const todayDiary = await diaryService.getTodayDiary(userId, date);
      console.log("오늘 일기 확인 결과:", todayDiary);
      
      if (todayDiary) {
        return NextResponse.json({
          hasTodayDiary: true,
          diary: todayDiary
        });
      } else {
        return NextResponse.json({
          hasTodayDiary: false,
          diary: null
        });
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
      diaries: diaries.map(d => ({
        id: d.id,
        created_at: d.created_at,
        content: d.content.substring(0, 20) + "..."
      }))
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
