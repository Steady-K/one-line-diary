"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Plant {
  id: number;
  type: string;
  level: number;
  experience: number;
  name?: string;
}

interface PlantGrowthProps {
  onLevelUp?: () => void;
  refreshTrigger?: number; // 새로고침 트리거
}

export default function PlantGrowth({
  onLevelUp,
  refreshTrigger,
}: PlantGrowthProps) {
  const { data: session } = useSession();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (session) {
      fetchPlant();
    }
  }, [session, refreshTrigger]); // refreshTrigger 추가

  const fetchPlant = async () => {
    try {
      const response = await fetch("/api/plant");
      if (response.ok) {
        const data = await response.json();
        setPlant(data.plant);
      }
    } catch (error) {
      console.error("식물 정보 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlantEmoji = (type: string, level: number) => {
    const plantTypes = {
      seedling: "🌱", // 씨앗
      sprout: "🌿", // 새싹
      stem: "🌾", // 줄기
      leaves: "🍃", // 잎파리
      tree: "🌳", // 나무
      flower: "🌸", // 꽃
      fruit: "🍎", // 열매
    };
    return plantTypes[type as keyof typeof plantTypes] || "🌱";
  };

  const getPlantName = (type: string) => {
    const plantNames = {
      seedling: "씨앗",
      sprout: "새싹",
      stem: "줄기",
      leaves: "잎파리",
      tree: "나무",
      flower: "꽃",
      fruit: "열매",
    };
    return plantNames[type as keyof typeof plantNames] || "씨앗";
  };

  const getNextLevelExp = (level: number) => {
    const plantStages = [
      { level: 1, exp: 10 }, // 씨앗
      { level: 2, exp: 20 }, // 새싹
      { level: 3, exp: 40 }, // 줄기
      { level: 4, exp: 80 }, // 잎파리
      { level: 5, exp: 160 }, // 나무
      { level: 6, exp: 320 }, // 꽃
      { level: 7, exp: 640 }, // 열매
    ];

    const stage = plantStages.find((s) => s.level === level);
    return stage ? stage.exp : 10;
  };

  const getProgressPercentage = () => {
    if (!plant) return 0;

    const plantStages = [
      { level: 1, exp: 10 }, // 씨앗
      { level: 2, exp: 20 }, // 새싹
      { level: 3, exp: 40 }, // 줄기
      { level: 4, exp: 80 }, // 잎파리
      { level: 5, exp: 160 }, // 나무
      { level: 6, exp: 320 }, // 꽃
      { level: 7, exp: 640 }, // 열매
    ];

    // 현재 레벨의 필요 경험치
    const currentStage = plantStages.find(
      (stage) => stage.level === plant.level
    );
    if (!currentStage) return 0;

    // 현재 레벨에서의 진행률 계산 (0~100%)
    const progress = (plant.experience / currentStage.exp) * 100;

    return Math.min(progress, 100);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🌱 나의 식물
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">아직 식물이 없습니다.</p>
          <p className="text-sm text-gray-400">
            첫 번째 일기를 작성하면 식물이 자라기 시작해요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <img
          src="/characters/lala-loving.png"
          alt="라라"
          className="w-6 h-6 object-contain mr-2"
        />
        나의 식물
      </h3>

      <div className="text-center">
        {/* 식물 표시 */}
        <div className="mb-4 animate-pulse flex justify-center">
          {getPlantEmoji(plant.type, plant.level).startsWith("/") ? (
            <img
              src={getPlantEmoji(plant.type, plant.level)}
              alt="식물"
              className="w-20 h-20 object-contain"
            />
          ) : (
            <span className="text-8xl">
              {getPlantEmoji(plant.type, plant.level)}
            </span>
          )}
        </div>

        {/* 식물 정보 */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-800">
            {plant.name || getPlantName(plant.type)}
          </h4>
          <p className="text-sm text-gray-600">
            레벨 {plant.level} • 경험치 {plant.experience}
          </p>
        </div>

        {/* 경험치 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>다음 레벨까지</span>
            <span>
              {(() => {
                const plantStages = [
                  { level: 1, exp: 10 }, // 씨앗
                  { level: 2, exp: 20 }, // 새싹
                  { level: 3, exp: 40 }, // 줄기
                  { level: 4, exp: 80 }, // 잎파리
                  { level: 5, exp: 160 }, // 나무
                  { level: 6, exp: 320 }, // 꽃
                  { level: 7, exp: 640 }, // 열매
                ];

                // 현재 레벨의 필요 경험치
                const currentStage = plantStages.find(
                  (stage) => stage.level === plant.level
                );
                if (!currentStage) return 0;

                const remainingExp = currentStage.exp - plant.experience;
                return remainingExp > 0 ? remainingExp : 0;
              })()}{" "}
              XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* 성장 팁 */}
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">
            💡 매일 일기를 작성하면 식물이 자라요!
            {plant.level < 6 &&
              ` 다음 단계: ${getPlantName(getNextStage(plant.type))}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function getNextStage(currentType: string): string {
  const stages = [
    "seedling",
    "sprout",
    "young",
    "mature",
    "flowering",
    "fruiting",
  ];
  const currentIndex = stages.indexOf(currentType);
  return currentIndex < stages.length - 1
    ? stages[currentIndex + 1]
    : currentType;
}
