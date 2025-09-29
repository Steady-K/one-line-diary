"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isPremium: boolean;
    planType: string;
    status: string;
  } | null>(null);

  const checkSubscriptionStatus = useCallback(
    async (retryCount = 0) => {
      try {
        const orderId = searchParams.get("orderId");
        const paymentKey = searchParams.get("paymentKey");
        const amount = searchParams.get("amount");

        console.log("구독 상태 확인 시작:", {
          orderId,
          paymentKey,
          amount,
          retryCount,
        });

        if (orderId && paymentKey && amount) {
          // 수동으로 구독 생성
          const response = await fetch("/api/payment/manual-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              paymentKey,
              amount: parseInt(amount),
            }),
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log("구독 생성 성공:", responseData);
          } else {
            const errorData = await response.json().catch(() => null);
            console.error("구독 생성 실패:", response.status, errorData);

            // 강제 구독 생성 시도
            const forceResponse = await fetch(
              "/api/payment/force-subscription",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (forceResponse.ok) {
              console.log("강제 구독 생성 성공");
            } else {
              console.error("강제 구독 생성도 실패");
            }
          }
        }

        // 잠시 대기 후 구독 상태 새로고침 (데이터베이스 동기화 시간 확보)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 구독 상태 새로고침
        const refreshResponse = await fetch(
          "/api/payment/refresh-subscription",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          console.log("구독 상태 새로고침:", data);
          setSubscriptionStatus(data);

          // 프리미엄 상태가 확인되면 일기 페이지로 이동
          if (data && data.isPremium) {
            console.log("프리미엄 상태 확인됨, 일기 페이지로 이동");
            setTimeout(() => {
              // 구독 상태를 URL 파라미터로 전달
              window.location.href = "/diary?premium=true";
            }, 2000);
          } else if (retryCount < 3) {
            // 프리미엄이 아니고 재시도 횟수가 3회 미만이면 재시도
            console.log(
              `프리미엄 상태가 아님 (${data?.isPremium}), ${
                retryCount + 1
              }번째 재시도`
            );
            setTimeout(() => {
              checkSubscriptionStatus(retryCount + 1);
            }, 2000);
          } else {
            console.log("재시도 횟수 초과, 수동으로 일기 페이지로 이동");
            setTimeout(() => {
              window.location.href = "/diary";
            }, 3000);
          }
        } else {
          console.error("구독 상태 새로고침 실패:", refreshResponse.status);
          if (retryCount < 3) {
            console.log(`새로고침 실패, ${retryCount + 1}번째 재시도`);
            setTimeout(() => {
              checkSubscriptionStatus(retryCount + 1);
            }, 2000);
          }
        }
      } catch (error) {
        console.error("구독 상태 확인 오류:", error);
        if (retryCount < 3) {
          console.log(`오류 발생, ${retryCount + 1}번째 재시도`);
          setTimeout(() => {
            checkSubscriptionStatus(retryCount + 1);
          }, 2000);
        }
      }
    },
    [searchParams]
  );

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const paymentKey = searchParams.get("paymentKey");
    const amount = searchParams.get("amount");

    if (orderId && paymentKey && amount) {
      // 결제 성공 처리
      setMessage("프리미엄 구독이 성공적으로 완료되었습니다!");
      setIsLoading(false);

      // 구독 상태 확인 및 업데이트
      checkSubscriptionStatus();
    } else {
      setMessage("결제 정보를 확인할 수 없습니다.");
      setIsLoading(false);
    }
  }, [searchParams, checkSubscriptionStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">결제 성공!</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {/* 구독 상태 표시 */}
          {subscriptionStatus && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ 구독 상태:{" "}
                {subscriptionStatus.isPremium ? "프리미엄" : "무료"}
              </h3>
              <p className="text-sm text-green-700">
                플랜: {subscriptionStatus.planType}
              </p>
            </div>
          )}

          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">
              ✨ 프리미엄 혜택
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 무제한 통계 분석</li>
              <li>• 모든 테마 사용</li>
              <li>• 클라우드 백업</li>
              <li>• 광고 제거</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/diary"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all block"
            >
              일기 작성하러 가기
            </Link>
            <p className="text-sm text-gray-500">
              {subscriptionStatus?.isPremium
                ? "2초 후 자동으로 이동합니다..."
                : "3초 후 자동으로 이동합니다..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">결제 확인 중...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
