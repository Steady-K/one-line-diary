import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { userService } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json(
        { error: "Theme is required" },
        { status: 400 }
      );
    }

    // 사용자 프로필에 테마 설정 저장
    const user = await userService.getUserByEmail(session.user.email!);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 사용자 테마 설정 업데이트 (nickname 필드에 테마 정보 저장하거나 별도 필드 사용)
    // 여기서는 간단하게 nickname에 테마 정보를 포함시키겠습니다
    const updatedUser = await userService.updateUser(user.id, {
      nickname: user.nickname || `theme_${theme}`,
      updated_at: new Date().toISOString(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update theme" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      theme,
      message: "테마가 성공적으로 저장되었습니다." 
    });
  } catch (error) {
    console.error("테마 저장 오류:", error);
    return NextResponse.json(
      { error: "Failed to save theme" },
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

    // 사용자 테마 설정 조회
    const user = await userService.getUserByEmail(session.user.email!);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // nickname에서 테마 정보 추출 (간단한 구현)
    const theme = user.nickname?.startsWith('theme_') 
      ? user.nickname.replace('theme_', '') 
      : 'default';

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("테마 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}
