import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { subscriptionService } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await subscriptionService.getActiveSubscription(
      session.user.id,
      session.user.email || undefined
    );

    if (!subscription) {
      return NextResponse.json({
        isPremium: false,
        planType: "free",
        status: "inactive",
      });
    }

    return NextResponse.json({
      isPremium: subscription.plan_type === "premium",
      planType: subscription.plan_type,
      status: subscription.status,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
    });
  } catch (error) {
    console.error("구독 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
