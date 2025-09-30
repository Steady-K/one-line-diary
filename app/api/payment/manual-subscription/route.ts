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

    console.log("수동 구독 생성 요청:", {
      userId: session.user.id,
      email: session.user.email,
      env: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "설정됨"
        : "설정되지 않음",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "설정됨"
        : "설정되지 않음",
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "설정됨"
        : "설정되지 않음",
    });

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
        session.user.email || undefined
      );

    console.log("기존 구독 확인:", existingSubscription);

    if (existingSubscription) {
      // 기존 구독이 있으면 상태를 업데이트
      const updatedSubscription = await subscriptionService.updateSubscription(
        existingSubscription.id,
        {
          plan_type: "premium",
          status: "active",
          imp_uid: orderId,
          imp_merchant_uid: paymentKey,
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }
      );

      console.log("기존 구독 업데이트 완료:", updatedSubscription);

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: "Existing subscription updated",
      });
    }

    // 사용자 ID 처리 (큰 OAuth ID 대응)
    let userId: number;
    const idString = session.user.id.toString();
    const id = parseInt(idString);

    if (isNaN(id) || id > 2147483647) {
      // 큰 ID인 경우 이메일로 사용자 조회
      const { userService } = await import("@/lib/supabase");
      const user = await userService.getUserByEmail(session.user.email!);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      userId = user.id;
    } else {
      userId = id;
    }

    // 구독 생성
    const subscription = await subscriptionService.createSubscription({
      user_id: userId,
      plan_type: "premium",
      status: "active",
      start_date: new Date().toISOString(),
      imp_uid: orderId,
      imp_merchant_uid: paymentKey,
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
    });

    console.log("수동 구독 생성 완료:", subscription);

    if (!subscription) {
      console.error("구독 생성 실패");
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    // 생성된 구독을 다시 조회하여 확인
    const verifySubscription = await subscriptionService.getActiveSubscription(
      userId,
      session.user.email || undefined
    );

    console.log("생성된 구독 확인:", verifySubscription);

    return NextResponse.json({
      success: true,
      subscription,
      verified: verifySubscription,
    });
  } catch (error) {
    console.error("수동 구독 생성 오류:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
