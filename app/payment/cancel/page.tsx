"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            결제가 취소되었습니다
          </h1>
          <p className="text-gray-600 mb-6">
            결제가 취소되었습니다. 언제든지 다시 시도해보실 수 있습니다.
          </p>

          <div className="space-y-3">
            <Link
              href="/payment"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all block"
            >
              다시 시도하기
            </Link>
            <Link
              href="/diary"
              className="w-full bg-white border-2 border-purple-500 text-purple-500 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all block"
            >
              무료로 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

