import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import { diaryService } from "../../../../lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // 일기 수정
    const updatedDiary = await diaryService.updateDiary(
      parseInt(id),
      {
        content: content.trim(),
        emotion: emotion || "😊",
        weather: weather || "🌞",
        mood: mood || 5,
        is_private: isPrivate ?? true,
      },
      userId,
      userEmail
    );

    if (!updatedDiary) {
      return NextResponse.json(
        { error: "Diary not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, diary: updatedDiary });
  } catch (error) {
    console.error("일기 수정 오류:", error);
    return NextResponse.json(
      { error: "Failed to update diary" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const userId = parseInt(session.user.id);
    const userEmail = session.user.email || undefined;

    // 일기 삭제
    const success = await diaryService.deleteDiary(
      parseInt(id),
      userId,
      userEmail
    );

    if (!success) {
      return NextResponse.json(
        { error: "Diary not found or delete failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("일기 삭제 오류:", error);
    return NextResponse.json(
      { error: "Failed to delete diary" },
      { status: 500 }
    );
  }
}
