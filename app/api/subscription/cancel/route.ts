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

    console.log("구독 취소 요청:", session.user.id, session.user.email);

    // 현재 활성 구독 조회
    const subscription = await subscriptionService.getActiveSubscription(
      session.user.id,
      session.user.email
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Active subscription not found" },
        { status: 404 }
      );
    }

    // 구독 상태를 취소로 변경
    const updatedSubscription = await subscriptionService.updateSubscription(
      subscription.id,
      {
        status: "cancelled",
        end_date: new Date().toISOString(), // 즉시 종료
      }
    );

    console.log("구독 취소 완료:", updatedSubscription);

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("구독 취소 오류:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
