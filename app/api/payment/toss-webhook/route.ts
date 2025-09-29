import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("토스페이먼츠 웹훅 수신:", JSON.stringify(body, null, 2));

    // 토스페이먼츠 웹훅 구조에 맞게 수정
    const { eventType, data } = body;

    // 결제 승인 완료 처리
    if (eventType === "PAYMENT_CONFIRMED") {
      const { orderId, paymentKey, amount, customerEmail } = data;

      console.log("결제 승인 완료:", {
        orderId,
        paymentKey,
        amount,
        customerEmail,
      });

      // 사용자 ID 조회 (이메일로)
      const user = await subscriptionService.getUserByEmail(customerEmail);

      if (user) {
        // 구독 생성
        const subscription = await subscriptionService.createSubscription({
          user_id: user.id,
          plan_type: "premium",
          status: "active",
          toss_order_id: orderId,
          toss_payment_key: paymentKey,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        });

        console.log("구독 생성 완료:", subscription);
      } else {
        console.error("사용자를 찾을 수 없습니다:", customerEmail);
      }
    }

    // 결제 상태 변경 처리
    if (eventType === "PAYMENT_STATUS_CHANGED") {
      const { orderId, status } = data;

      if (status === "CANCELED") {
        // 구독 취소 처리
        await subscriptionService.updateSubscriptionByTossOrderId(orderId, {
          status: "cancelled",
        });

        console.log("구독 취소 완료:", orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("토스페이먼츠 웹훅 처리 오류:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
