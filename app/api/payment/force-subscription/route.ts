import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { subscriptionService } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("강제 구독 생성 요청:", session.user.id, session.user.email);

    // 기존 구독 삭제
    const existingSubscription =
      await subscriptionService.getActiveSubscription(
        session.user.id,
        session.user.email || undefined
      );

    if (existingSubscription) {
      console.log("기존 구독 삭제:", existingSubscription.id);
      // 기존 구독을 비활성화
      await subscriptionService.updateSubscription(existingSubscription.id, {
        status: "cancelled",
      });
    }

    // 새 구독 생성
    const subscription = await subscriptionService.createSubscription({
      user_id: parseInt(session.user.id),
      plan_type: "premium",
      status: "active",
      start_date: new Date().toISOString(),
      imp_uid: `force_${Date.now()}`,
      imp_merchant_uid: `force_${Date.now()}`,
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
    });

    console.log("강제 구독 생성 완료:", subscription);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("강제 구독 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
