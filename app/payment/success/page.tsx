"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

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

      // 3초 후 일기 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/diary");
      }, 3000);
    } else {
      setMessage("결제 정보를 확인할 수 없습니다.");
      setIsLoading(false);
    }
  }, [searchParams, router]);

  const checkSubscriptionStatus = async () => {
    try {
      const orderId = searchParams.get("orderId");
      const paymentKey = searchParams.get("paymentKey");
      const amount = searchParams.get("amount");

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
          console.log("구독 생성 성공");
        } else {
          console.error("구독 생성 실패, 강제 구독 시도");

          // 강제 구독 생성 시도
          const forceResponse = await fetch("/api/payment/force-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (forceResponse.ok) {
            console.log("강제 구독 생성 성공");
          } else {
            console.error("강제 구독 생성도 실패");
          }
        }
      }

      // 구독 상태 새로고침
      const refreshResponse = await fetch("/api/payment/refresh-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log("구독 상태 새로고침:", data);

        // 페이지 새로고침으로 상태 반영
        if (data.isPremium) {
          setTimeout(() => {
            window.location.href = "/diary";
          }, 2000);
        }
      }
    } catch (error) {
      console.error("구독 상태 확인 오류:", error);
    }
  };

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
              3초 후 자동으로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
