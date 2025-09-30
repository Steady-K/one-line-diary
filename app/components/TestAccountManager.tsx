"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function TestAccountManager() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("credentials", {
        email: "test@test.com",
        password: "test123",
        redirect: false,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePremiumSubscription = async (
    planType: "premium" | "lifetime_premium"
  ) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/test-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // 페이지 새로고침하여 구독 상태 업데이트
        window.location.reload();
      } else {
        setMessage(`오류: ${data.error}`);
      }
    } catch (error) {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-yellow-800 mb-2">🧪 테스트 계정</h3>

      {!session ? (
        <div>
          <p className="text-sm text-yellow-700 mb-2">
            이메일: test@test.com
            <br />
            비밀번호: test123
          </p>
          <button
            onClick={handleTestLogin}
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "테스트 계정 로그인"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-yellow-700 mb-2">
            로그인됨: {session.user?.email}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleCreatePremiumSubscription("premium")}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "월간 프리미엄 활성화"}
            </button>
            <button
              onClick={() =>
                handleCreatePremiumSubscription("lifetime_premium")
              }
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "영구 프리미엄 활성화"}
            </button>
            <button
              onClick={() => signOut()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700">
          {message}
        </div>
      )}
    </div>
  );
}
