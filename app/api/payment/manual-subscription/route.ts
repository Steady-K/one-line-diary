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

    const { orderId, paymentKey, amount } = await request.json();

    if (!orderId || !paymentKey || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 기존 구독 확인
    const existingSubscription =
      await subscriptionService.getActiveSubscription(
        session.user.id,
        session.user.email
      );

    console.log("기존 구독 확인:", existingSubscription);

    if (existingSubscription) {
      // 기존 구독이 있으면 상태를 업데이트
      const updatedSubscription = await subscriptionService.updateSubscription(
        existingSubscription.id,
        {
          plan_type: "premium",
          status: "active",
          toss_order_id: orderId,
          toss_payment_key: paymentKey,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      );

      console.log("기존 구독 업데이트 완료:", updatedSubscription);

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: "Existing subscription updated",
      });
    }

    // 구독 생성
    const subscription = await subscriptionService.createSubscription({
      user_id: session.user.id,
      plan_type: "premium",
      status: "active",
      toss_order_id: orderId,
      toss_payment_key: paymentKey,
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    });

    console.log("수동 구독 생성 완료:", subscription);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("수동 구독 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
