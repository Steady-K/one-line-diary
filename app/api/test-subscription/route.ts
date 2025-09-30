import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 테스트 계정인지 확인
    if (session.user.id !== "test-user-id") {
      return NextResponse.json(
        { error: "테스트 계정만 사용 가능합니다." },
        { status: 403 }
      );
    }

    const { planType = "premium" } = await request.json();

    // 기존 구독이 있는지 확인
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      // 기존 구독 업데이트
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_type: planType,
          status: "active",
          start_date: new Date().toISOString(),
          end_date:
            planType === "lifetime_premium"
              ? null
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", existingSubscription.id)
        .select()
        .single();

      if (updateError) {
        console.error("구독 업데이트 오류:", updateError);
        return NextResponse.json(
          { error: "구독 업데이트 실패" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: `${
          planType === "premium" ? "월간" : "영구"
        } 프리미엄 구독이 활성화되었습니다.`,
      });
    } else {
      // 새 구독 생성
      const { data: subscription, error: createError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: session.user.id,
            plan_type: planType,
            status: "active",
            start_date: new Date().toISOString(),
            end_date:
              planType === "lifetime_premium"
                ? null
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("구독 생성 오류:", createError);
        return NextResponse.json({ error: "구독 생성 실패" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        subscription,
        message: `${
          planType === "premium" ? "월간" : "영구"
        } 프리미엄 구독이 생성되었습니다.`,
      });
    }
  } catch (error) {
    console.error("테스트 구독 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
