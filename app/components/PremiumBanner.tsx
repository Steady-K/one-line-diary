"use client";

import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function PremiumBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-8 text-white">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">
            🚫 광고 없는 깔끔한 일기 작성!
          </h3>
          <p className="text-purple-100 mb-4">
            프리미엄으로 업그레이드하고 광고 없이 편안하게 일기를 작성해보세요.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🚫</span>
              <span className="text-sm">모든 광고 제거</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm">빠른 일기 작성</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">✨</span>
              <span className="text-sm">깔끔한 인터페이스</span>
            </div>
          </div>
        </div>

        <div className="ml-6">
          <Link
            href="/payment"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            지금 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
