"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Link from "next/link";

// 아임포트 타입 정의
declare global {
  interface Window {
    IMP: {
      init: (impCode: string) => void;
      request_pay: (
        params: PaymentParams,
        callback: (response: PaymentResponse) => void
      ) => void;
    };
  }
}

interface PaymentParams {
  pg: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email: string;
  buyer_name: string;
  buyer_tel: string;
  m_redirect_url: string;
}

interface PaymentResponse {
  success: boolean;
  imp_uid: string;
  merchant_uid: string;
  paid_amount: number;
  status: string;
  error_msg?: string;
}

const IMP_CODE = process.env.NEXT_PUBLIC_IMP_CODE || "imp123456789";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<{
    isPremium: boolean;
    planType: string;
  } | null>(null);
  const [selectedPg, setSelectedPg] = useState("html5_inicis");
  const [selectedPayMethod, setSelectedPayMethod] = useState("card");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  // 아임포트 SDK 로드
  useEffect(() => {
    console.log("아임포트 SDK 로드 시작");
    console.log(
      "환경변수 NEXT_PUBLIC_IMP_CODE:",
      process.env.NEXT_PUBLIC_IMP_CODE
    );
    console.log("IMP_CODE:", IMP_CODE);

    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.onload = () => {
      console.log("아임포트 SDK 로드 완료");
      if (window.IMP) {
        console.log("아임포트 초기화 시작, 코드:", IMP_CODE);
        window.IMP.init(IMP_CODE);
        console.log("아임포트 초기화 완료");
      } else {
        console.error("window.IMP가 정의되지 않음");
      }
    };
    script.onerror = () => {
      console.error("아임포트 SDK 로드 실패");
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector(
        'script[src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("구독 정보 조회 오류:", error);
    }
  };

  // PG사별 결제 수단 옵션
  const pgOptions = [
    {
      value: "html5_inicis",
      label: "KG이니시스",
      description: "신용카드, 체크카드, 계좌이체",
      payMethods: [
        { value: "card", label: "신용카드/체크카드" },
        { value: "trans", label: "계좌이체" },
        { value: "vbank", label: "가상계좌" },
      ],
    },
    {
      value: "nice",
      label: "NHN KCP",
      description: "신용카드, 간편결제, 휴대폰",
      payMethods: [
        { value: "card", label: "신용카드/체크카드" },
        { value: "easy", label: "간편결제" },
        { value: "phone", label: "휴대폰 결제" },
      ],
    },
    {
      value: "kakaopay",
      label: "카카오페이",
      description: "카카오페이 간편결제",
      payMethods: [{ value: "kakaopay", label: "카카오페이" }],
    },
  ];

  // 선택된 PG사에 따른 결제 수단 업데이트
  const handlePgChange = (pgValue: string) => {
    setSelectedPg(pgValue);
    const selectedPgOption = pgOptions.find(
      (option) => option.value === pgValue
    );
    if (selectedPgOption && selectedPgOption.payMethods.length > 0) {
      setSelectedPayMethod(selectedPgOption.payMethods[0].value);
    }
  };

  const handleSubscribe = async () => {
    if (!session || !window.IMP) return;

    console.log("결제 시작");
    console.log("선택된 PG사:", selectedPg);
    console.log("선택된 결제수단:", selectedPayMethod);
    console.log("아임포트 가맹점 코드:", IMP_CODE);

    setIsLoading(true);

    try {
      // 결제 정보 생성
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 선택된 플랜에 따른 결제 정보 설정
      const selectedPlan = plans.find(
        (plan) => plan.name === "프리미엄" || plan.name === "영구 프리미엄"
      );

      const paymentData = {
        pg: selectedPg, // 선택된 PG사
        pay_method: selectedPayMethod, // 선택된 결제 수단
        merchant_uid: orderId, // 주문번호
        name:
          selectedPlan?.name === "영구 프리미엄"
            ? "한줄일기 영구 프리미엄"
            : "한줄일기 Premium", // 상품명
        amount: selectedPlan?.name === "영구 프리미엄" ? 14900 : 1900, // 결제 금액
        buyer_email: session.user?.email || "", // 구매자 이메일
        buyer_name: session.user?.name || "사용자", // 구매자 이름
        buyer_tel: "010-1234-5678", // 구매자 전화번호 (필수)
        m_redirect_url: `${window.location.origin}/payment/success`, // 모바일 결제 완료 후 리다이렉트 URL
      };

      console.log("결제 요청 데이터:", paymentData);

      window.IMP.request_pay(paymentData, (response) => {
        console.log("아임포트 결제 응답:", response);

        if (response.success) {
          // 결제 성공
          console.log("결제 성공:", response);

          // 결제 검증을 위해 서버로 전송
          fetch("/api/payment/iamport-webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imp_uid: response.imp_uid,
              merchant_uid: response.merchant_uid,
              amount: response.paid_amount,
              status: response.status,
              buyer_email: session.user?.email,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                // 결제 검증 성공 시 성공 페이지로 이동
                window.location.href = "/payment/success";
              } else {
                alert("결제 검증에 실패했습니다.");
                setIsLoading(false);
              }
            })
            .catch((error) => {
              console.error("결제 검증 오류:", error);
              alert("결제 처리 중 오류가 발생했습니다.");
              setIsLoading(false);
            });
        } else {
          // 결제 실패
          console.error("결제 실패:", response);
          alert(`결제 실패: ${response.error_msg}`);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("결제 오류:", error);
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
      name: "월간 구독",
      price: "1,900",
      period: "/월",
      features: [
        "🚫 모든 광고 완전 제거",
        "⚡ 광고 없이 빠른 일기 작성",
        "✨ 깔끔하고 방해받지 않는 인터페이스",
        "📊 무제한 통계 분석",
        "🎨 모든 테마 사용",
        "☁️ 클라우드 백업",
        "📤 데이터 내보내기",
      ],
      buttonText: subscription?.isPremium ? "이용 중" : "월간 구독",
      disabled: subscription?.isPremium,
      popular: true,
      current: subscription?.isPremium,
    },
    {
      name: "프리미엄",
      price: "14,900",
      period: " (일회성)",
      features: [
        "🚫 모든 광고 영구 제거",
        "⚡ 광고 없이 빠른 일기 작성",
        "✨ 깔끔하고 방해받지 않는 인터페이스",
        "📊 무제한 통계 분석",
        "🎨 모든 테마 사용",
        "☁️ 클라우드 백업",
        "📤 데이터 내보내기",
        "💎 평생 프리미엄 혜택",
        "🎁 추가 업데이트 무료 제공",
      ],
      buttonText: subscription?.isPremium ? "이용 중" : "영구 구독",
      disabled: subscription?.isPremium,
      popular: false,
      current: subscription?.isPremium,
      isLifetime: true,
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
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 relative flex flex-col h-[650px] ${
                  plan.popular ? "ring-2 ring-purple-500" : ""
                } ${plan.current ? "ring-2 ring-green-500" : ""} ${
                  plan.isLifetime
                    ? "ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : ""
                }`}
              >
                {plan.popular && !plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium min-w-[60px] text-center">
                      월간 플랜
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium min-w-[80px] text-center">
                      현재 플랜
                    </span>
                  </div>
                )}

                {plan.isLifetime && !plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium min-w-[100px] text-center">
                      평생 플랜
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.name}
                  </h3>
                  <div
                    className={`text-4xl font-bold mb-1 ${
                      plan.isLifetime ? "text-yellow-600" : "text-purple-600"
                    }`}
                  >
                    ₩{plan.price}
                    {plan.period && (
                      <span className="text-lg text-gray-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.period && <p className="text-sm text-gray-500"></p>}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 결제 수단 선택 제거 - 모달로 이동 */}

                <div className="mt-auto">
                  <button
                    onClick={
                      plan.name === "무료"
                        ? undefined
                        : plan.name === "월간 구독" || plan.name === "프리미엄"
                        ? () => setShowPaymentModal(true)
                        : undefined
                    }
                    disabled={plan.disabled || isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      plan.current
                        ? "bg-green-100 text-green-700 cursor-default"
                        : plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                        : plan.isLifetime
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? "처리 중..." : plan.buttonText}
                  </button>
                </div>
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

      {/* 결제 수단 선택 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                결제 수단 선택
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* PG사 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                결제 대행사 선택
              </label>
              <div className="space-y-2">
                {pgOptions.map((pg) => (
                  <label
                    key={pg.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPg === pg.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pg"
                      value={pg.value}
                      checked={selectedPg === pg.value}
                      onChange={(e) => handlePgChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {pg.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pg.description}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedPg === pg.value
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPg === pg.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                결제 수단 선택
              </label>
              <div className="space-y-2">
                {pgOptions
                  .find((pg) => pg.value === selectedPg)
                  ?.payMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPayMethod === method.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value={method.value}
                        checked={selectedPayMethod === method.value}
                        onChange={(e) => setSelectedPayMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {method.label}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedPayMethod === method.value
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPayMethod === method.value && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleSubscribe();
                }}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
