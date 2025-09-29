"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// 토스페이먼츠 SDK는 CDN으로 로드
import Header from "../components/Header";
import Link from "next/link";

// 토스페이먼츠 타입 정의
declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: any) => void;
    };
  }
}

const clientKey =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_placeholder";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("구독 정보 조회 오류:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      // 토스페이먼츠 SDK 로드 확인
      if (typeof window !== "undefined" && !window.TossPayments) {
        // SDK가 로드되지 않은 경우 스크립트 추가
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v1/payment";
        script.onload = () => {
          initializePayment();
        };
        document.head.appendChild(script);
      } else {
        initializePayment();
      }
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const initializePayment = () => {
    try {
      // 결제 정보 생성
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const tossPayments = window.TossPayments(clientKey);

      tossPayments.requestPayment("카드", {
        amount: 1900,
        orderId: orderId,
        orderName: "한줄일기 Premium",
        customerName: session?.user?.name || "사용자",
        customerEmail: session?.user?.email || "",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/cancel`,
      });
    } catch (error) {
      console.error("결제 초기화 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const plans = [
    {
      name: "무료",
      price: "0",
      period: "",
      features: [
        "일기 작성",
        "7일 통계",
        "기본 테마",
        "기본 감정 태그",
        "광고 노출",
      ],
      buttonText: subscription?.isPremium
        ? "Premium 사용자"
        : subscription?.planType === "free"
        ? "현재 플랜"
        : "무료 플랜",
      disabled: subscription?.planType === "free" || subscription?.isPremium,
      current: subscription?.planType === "free",
    },
    {
      name: "프리미엄",
      price: "1,900",
      period: "/월",
      priceId: "price_premium_monthly", // 실제 Stripe 가격 ID로 교체 필요
      features: [
        "🚫 모든 광고 완전 제거",
        "⚡ 광고 없이 빠른 일기 작성",
        "✨ 깔끔하고 방해받지 않는 인터페이스",
        "📊 무제한 통계 분석",
        "🎨 모든 테마 사용",
        "☁️ 클라우드 백업",
        "📤 데이터 내보내기",
      ],
      buttonText: subscription?.isPremium ? "현재 플랜" : "프리미엄 시작하기",
      disabled: subscription?.isPremium,
      popular: true,
      current: subscription?.isPremium,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header isPremium={subscription?.isPremium || false} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <Link
              href="/diary"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
            >
              ← 일기로 돌아가기
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              광고 없는 깔끔한 일기 작성
            </h1>
            <p className="text-gray-600">
              프리미엄으로 업그레이드하고 방해받지 않는 일기 작성 경험을
              만나보세요
            </p>
          </div>

          {/* 플랜 카드들 */}
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 relative ${
                  plan.popular ? "ring-2 ring-purple-500 scale-105" : ""
                } ${plan.current ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && !plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      인기
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      현재 플랜
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    ₩{plan.price}
                    {plan.period && (
                      <span className="text-lg text-gray-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.period && (
                    <p className="text-sm text-gray-500">언제든지 취소 가능</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.name === "무료" ? undefined : handleSubscribe}
                  disabled={plan.disabled || isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    plan.current
                      ? "bg-green-100 text-green-700 cursor-default"
                      : plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "처리 중..." : plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ 섹션 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              자주 묻는 질문
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  언제든지 취소할 수 있나요?
                </h3>
                <p className="text-gray-600 text-sm">
                  네, 언제든지 구독을 취소할 수 있으며 취소 즉시 효과가
                  적용됩니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  무료 버전과 차이점은?
                </h3>
                <p className="text-gray-600 text-sm">
                  무료 버전은 7일 통계만 제공하며, 프리미엄은 무제한 통계와 고급
                  기능을 제공합니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  데이터는 안전한가요?
                </h3>
                <p className="text-gray-600 text-sm">
                  네, 모든 데이터는 암호화되어 저장되며 개인정보는 완벽하게
                  보호됩니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  환불 정책은?
                </h3>
                <p className="text-gray-600 text-sm">
                  첫 구독 후 7일 이내에는 전액 환불이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
