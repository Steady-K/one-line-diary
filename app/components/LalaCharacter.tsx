"use client";

import { useState, useEffect } from "react";

interface LalaCharacterProps {
  emotion: string;
  level?: number;
  experience?: number;
  onCharacterClick?: () => void;
}

// 라라 스타일 감정별 캐릭터 설정
const lalaEmotions = {
  "😊": {
    name: "행복한 라라",
    image: "/characters/lala-happy.png",
    color: "#FFD93D",
    message: "오늘도 행복한 하루였구나! 🌟",
    animation: "bounce",
  },
  "😠": {
    name: "화난 라라",
    image: "/characters/lala-angry.png",
    color: "#FF6B6B",
    message: "화가 나는 일이 있었구나... 숨 깊게 쉬어보자 🔥",
    animation: "shake",
  },
  "😢": {
    name: "슬픈 라라",
    image: "/characters/lala-sad.png",
    color: "#6BC5D8",
    message: "슬픈 마음도 괜찮아... 함께 있어줄게 💙",
    animation: "gentle-sway",
  },
  "😴": {
    name: "졸린 라라",
    image: "/characters/lala-sleepy.png",
    color: "#9B59B6",
    message: "피곤한 하루였구나... 푹 쉬어야 해 🌙",
    animation: "sleepy-sway",
  },
  "😮": {
    name: "황당한 라라",
    image: "/characters/lala-surprised.png",
    color: "#FF8C00",
    message: "이런 황당한 일이! 괜찮아, 그럴 수도 있지 😮",
    animation: "jiggle",
  },
  "🤔": {
    name: "생각중 라라",
    image: "/characters/lala-thinking.png",
    color: "#95A5A6",
    message: "많은 생각이 있었구나... 천천히 정리해보자 🤔",
    animation: "thoughtful-nod",
  },
  "😍": {
    name: "사랑스러운 라라",
    image: "/characters/lala-loving.png",
    color: "#FF69B4",
    message: "사랑이 가득한 하루네! 마음이 따뜻해져 💕",
    animation: "heart-beat",
  },
  "😎": {
    name: "멋진 라라",
    image: "/characters/lala-cool.png",
    color: "#3498DB",
    message: "오늘 정말 멋진 하루였어! 자랑스러워 🌊",
    animation: "cool-pose",
  },
  "😅": {
    name: "당황한 라라",
    image: "/characters/lala-embarrassed.png",
    color: "#FF9800",
    message: "당황스러운 일이 있었구나... 웃음이 나와 😅",
    animation: "embarrassed-wiggle",
  },
};

export default function LalaCharacter({
  emotion,
  level = 1,
  experience = 0,
  onCharacterClick,
}: LalaCharacterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const lala =
    lalaEmotions[emotion as keyof typeof lalaEmotions] || lalaEmotions["😊"];

  // 애니메이션 효과
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleClick = () => {
    setIsAnimating(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
    onCharacterClick?.();
  };

  // 라라 캐릭터 렌더링 함수
  const renderLalaCharacter = () => {
    const baseStyle =
      "w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border-2 border-white";

    return (
      <div
        className={`${baseStyle} bg-gradient-to-br from-amber-200 to-orange-300`}
        style={{ backgroundColor: lala.color }}
      >
        {/* 라라 이미지 */}
        <img
          src={lala.image}
          alt={lala.name}
          className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
        />
      </div>
    );
  };

  return (
    <div className="relative">
      {/* 라라 캐릭터 메인 */}
      <div
        className={`
          relative cursor-pointer transform transition-all duration-300 hover:scale-105
          ${isAnimating ? "animate-pulse" : ""}
        `}
        onClick={handleClick}
      >
        {/* 라라 캐릭터 */}
        {renderLalaCharacter()}
      </div>

      {/* 캐릭터 이름과 레벨 - 이미지 아래 */}
      <div className="mt-4 text-center">
        <div className="bg-white rounded-full px-2 py-1 shadow-md border text-xs inline-block">
          <p className="font-bold text-gray-800">{lala.name}</p>
          <p className="text-gray-600">Lv.{level}</p>
        </div>
      </div>

      {/* 경험치 바 - 이름 아래 */}
      <div className="mt-2 w-16 lg:w-20 mx-auto">
        <div className="bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${experience % 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-center text-gray-600 mt-1">
          {experience % 100}/100 XP
        </p>
      </div>

      {/* 클릭 시 나타나는 메시지 */}
      {showMessage && (
        <div className="absolute -top-32 sm:-top-24 left-1/2 transform -translate-x-1/2 z-20 px-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-xl border-2 border-purple-200 w-64 sm:w-72 max-w-[calc(100vw-2rem)]">
            <p className="text-xs sm:text-sm text-gray-800 text-center font-medium leading-relaxed break-words">
              {lala.message}
            </p>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
