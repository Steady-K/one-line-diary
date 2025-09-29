import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { achievementService } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email; // 이메일 추가

    // 사용자의 업적 조회
    const achievements = await achievementService.getUserAchievements(
      session.user.id,
      userEmail
    );

    // 업적 진행률 조회
    const progress = await achievementService.getAchievementProgress(
      session.user.id,
      userEmail
    );

    return NextResponse.json({ achievements, progress });
  } catch (error) {
    console.error("업적 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email; // 이메일 추가
    const { type, title, description, icon } = await request.json();

    // 이미 달성한 업적인지 확인
    const existingAchievement =
      await achievementService.getUserAchievementByType(
        session.user.id,
        type,
        userEmail
      );

    if (existingAchievement) {
      return NextResponse.json({
        success: false,
        message: "이미 달성한 업적입니다.",
      });
    }

    // 새 업적 생성
    const achievement = await achievementService.createAchievement({
      user_id: parseInt(session.user.id),
      type,
      title,
      description,
      icon,
    });

    return NextResponse.json({
      success: true,
      achievement,
    });
  } catch (error) {
    console.error("업적 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}
