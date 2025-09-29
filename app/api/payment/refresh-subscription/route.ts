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

    console.log(
      "구독 상태 새로고침 요청:",
      session.user.id,
      session.user.email
    );

    // 최신 구독 상태 조회
    const subscription = await subscriptionService.getActiveSubscription(
      session.user.id,
      session.user.email
    );

    if (!subscription) {
      return NextResponse.json({
        isPremium: false,
        planType: "free",
        status: "inactive",
      });
    }

    const result = {
      isPremium: subscription.plan_type === "premium",
      planType: subscription.plan_type,
      status: subscription.status,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
    };

    console.log("구독 상태 새로고침 결과:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("구독 상태 새로고침 오류:", error);
    return NextResponse.json(
      { error: "Failed to refresh subscription" },
      { status: 500 }
    );
  }
}
