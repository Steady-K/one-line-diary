import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { plantService } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자의 식물 정보 조회 또는 생성
    const plant = await plantService.getOrCreateUserPlant(
      session.user.id,
      session.user.email
    );

    return NextResponse.json({ plant });
  } catch (error) {
    console.error("식물 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch plant" },
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

    const { experience, name } = await request.json();

    // 식물 경험치 추가 및 업데이트
    const result = await plantService.addExperience(
      session.user.id,
      experience || 1,
      name,
      session.user.email
    );

    return NextResponse.json({
      success: true,
      plant: result.plant,
      leveledUp: result.leveledUp,
    });
  } catch (error) {
    console.error("식물 업데이트 오류:", error);
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}
