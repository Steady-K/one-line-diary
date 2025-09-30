import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // 무작위 테스트 계정 정보 생성
    const testAccounts = [
      {
        email: "test1@example.com",
        password: "test123",
        name: "김민수",
        gender: "male",
        birth_date: "1995-03-15"
      },
      {
        email: "test2@example.com", 
        password: "test123",
        name: "이지은",
        gender: "female",
        birth_date: "1992-07-22"
      },
      {
        email: "test3@example.com",
        password: "test123", 
        name: "박준호",
        gender: "male",
        birth_date: "1988-11-08"
      }
    ];

    const results = [];

    for (const account of testAccounts) {
      try {
        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(account.password, 12);

        // 사용자 생성 또는 업데이트
        const { data: user, error: userError } = await supabase
          .from("users")
          .upsert(
            {
              email: account.email,
              name: account.name,
              password_hash: hashedPassword,
              gender: account.gender,
              birth_date: account.birth_date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "email",
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (userError) {
          console.error(`사용자 생성 오류 (${account.email}):`, userError);
          results.push({
            email: account.email,
            success: false,
            error: userError.message
          });
          continue;
        }

        // 프리미엄 구독 생성
        const { data: subscription, error: subError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: user.id,
              plan_type: "premium",
              status: "active",
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (subError) {
          console.error(`구독 생성 오류 (${account.email}):`, subError);
          results.push({
            email: account.email,
            success: false,
            error: subError.message
          });
          continue;
        }

        results.push({
          email: account.email,
          password: account.password,
          name: account.name,
          gender: account.gender,
          birth_date: account.birth_date,
          success: true,
          userId: user.id,
          subscriptionId: subscription.id
        });

      } catch (error) {
        console.error(`계정 생성 중 오류 (${account.email}):`, error);
        results.push({
          email: account.email,
          success: false,
          error: "계정 생성 실패"
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "테스트 계정들이 생성되었습니다.",
      accounts: results
    });

  } catch (error) {
    console.error("테스트 계정 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
