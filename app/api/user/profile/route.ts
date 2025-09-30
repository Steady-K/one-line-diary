import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { userService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자 프로필 조회
    const profile = await userService.getUserProfile(
      session.user.id,
      session.user.email || undefined
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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

    const { name, gender, birthDate } = await request.json();

    // 프로필 생성
    const profile = await userService.createUserProfile(
      session.user.id,
      session.user.email || "",
      {
        name,
        gender,
        birth_date: birthDate,
      }
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("프로필 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, gender, birthDate } = await request.json();

    // 프로필 수정
    const profile = await userService.updateUserProfile(
      session.user.id,
      session.user.email || "",
      {
        name,
        gender,
        birth_date: birthDate,
      }
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("프로필 수정 오류:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
