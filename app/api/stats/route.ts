import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { diaryService } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(
      searchParams.get("month") || String(new Date().getMonth() + 1)
    );
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    );

    // Supabase를 사용한 통계 조회
    const stats = await diaryService.getUserStats(
      session.user.id,
      month,
      year,
      session.user.email || undefined
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("통계 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
