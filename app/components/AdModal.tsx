"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isPremium: boolean;
}

export default function AdModal({
  isOpen,
  onClose,
  onContinue,
  isPremium,
}: AdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  // 5초 카운트다운 후 스킵 가능
  useEffect(() => {
    if (isOpen && !isPremium) {
      setCountdown(5);
      setCanSkip(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, isPremium]);

  // 프리미엄 사용자는 광고를 보지 않음
  if (isPremium || !isOpen) return null;

  const handleSkip = () => {
    if (canSkip) {
      onContinue();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleDownload = () => {
    // 실제 광고 클릭 시 처리 (예: 외부 링크로 이동)
    window.open("https://example.com", "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 광고 내용 */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">📱</span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-2">
            새로운 앱을 발견해보세요!
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            당신의 일상을 더 특별하게 만들어줄 앱을 만나보세요
          </p>

          {/* 광고 이미지/콘텐츠 영역 */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">
                  일상 관리 앱
                </h4>
                <p className="text-xs text-gray-600">
                  스마트한 일상 관리의 시작
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-yellow-400 text-xs">★★★★★</span>
                  <span className="text-xs text-gray-500">(4.8)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer"
            >
              지금 다운로드
            </button>

            <button
              onClick={handleSkip}
              disabled={!canSkip}
              className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
                canSkip
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {canSkip ? "건너뛰기" : `${countdown}초 후 건너뛰기`}
            </button>
          </div>

          {/* 프리미엄 업그레이드 링크 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">광고가 불편하신가요?</p>
            <Link
              href="/payment"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              프리미엄으로 업그레이드하여 광고 제거하기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
