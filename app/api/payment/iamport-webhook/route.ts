import { NextRequest, NextResponse } from "next/server";
import { subscriptionService, userService } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("아임포트 결제 검증 요청:", JSON.stringify(body, null, 2));

    const { imp_uid, merchant_uid, amount, status, buyer_email } = body;

    // 결제 상태 확인
    if (status !== "paid") {
      console.log("결제가 완료되지 않음:", status);
      return NextResponse.json({ success: false, message: "결제 미완료" });
    }

    // 아임포트 서버에서 결제 정보 검증
    const verificationResponse = await fetch(
      `https://api.iamport.kr/payments/${imp_uid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.IMP_ACCESS_TOKEN}`, // 아임포트 액세스 토큰
        },
      }
    );

    if (!verificationResponse.ok) {
      console.error("아임포트 결제 검증 실패");
      return NextResponse.json({ success: false, message: "결제 검증 실패" });
    }

    const verificationData = await verificationResponse.json();
    console.log("아임포트 결제 검증 결과:", verificationData);

    // 결제 금액 검증
    if (verificationData.response.amount !== amount) {
      console.error("결제 금액 불일치:", {
        expected: amount,
        actual: verificationData.response.amount,
      });
      return NextResponse.json({ success: false, message: "결제 금액 불일치" });
    }

    // 사용자 ID 조회 (이메일로)
    const user = await userService.getUserByEmail(buyer_email);

    if (!user) {
      console.error("사용자를 찾을 수 없습니다:", buyer_email);
      return NextResponse.json({ success: false, message: "사용자 없음" });
    }

    console.log("사용자 찾음:", user.id, user.email);

    // 기존 구독 확인
    const existingSubscription =
      await subscriptionService.getActiveSubscription(user.id, user.email);

    if (existingSubscription) {
      console.log("기존 구독 업데이트:", existingSubscription.id);
      // 기존 구독을 프리미엄으로 업데이트
      const updatedSubscription =
        await subscriptionService.updateSubscription(existingSubscription.id, {
          plan_type: "premium",
          status: "active",
          imp_uid: imp_uid,
          imp_merchant_uid: merchant_uid,
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30일 후
        });
      console.log("기존 구독 업데이트 완료:", updatedSubscription);
    } else {
      console.log("새 구독 생성");
      // 새 구독 생성
      const subscription = await subscriptionService.createSubscription({
        user_id: user.id,
        plan_type: "premium",
        status: "active",
        start_date: new Date().toISOString(),
        imp_uid: imp_uid,
        imp_merchant_uid: merchant_uid,
        end_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30일 후
      });

      console.log("구독 생성 완료:", subscription);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("아임포트 웹훅 처리 오류:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
