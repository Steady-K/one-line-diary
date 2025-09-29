"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface AchievementSystemProps {
  onAchievementUnlocked?: (achievement: Achievement) => void;
  refreshTrigger?: number; // 새로고침 트리거
}

export default function AchievementSystem({
  onAchievementUnlocked,
  refreshTrigger,
}: AchievementSystemProps) {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAchievement, setShowNewAchievement] =
    useState<Achievement | null>(null);

  useEffect(() => {
    if (session) {
      fetchAchievements();
    }
  }, [session, refreshTrigger]); // refreshTrigger 추가

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setProgress(data.progress || {});
      }
    } catch (error) {
      console.error("업적 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementProgress = (type: string) => {
    // 실제 API에서 가져온 진행률 사용
    return progress[type] || 0;
  };

  const getAvailableAchievements = () => {
    return [
      {
        type: "first_diary",
        title: "첫 번째 일기",
        description: "첫 번째 일기를 작성하세요",
        icon: "📝",
        progress: getAchievementProgress("first_diary"),
      },
      {
        type: "week_streak",
        title: "일주일 연속",
        description: "7일 연속으로 일기를 작성하세요",
        icon: "🔥",
        progress: getAchievementProgress("week_streak"),
      },
      {
        type: "month_streak",
        title: "한 달 연속",
        description: "30일 연속으로 일기를 작성하세요",
        icon: "🏆",
        progress: getAchievementProgress("month_streak"),
      },
      {
        type: "emotion_master",
        title: "감정 마스터",
        description: "모든 감정 태그를 사용해보세요",
        icon: "😊",
        progress: getAchievementProgress("emotion_master"),
      },
      {
        type: "plant_grower",
        title: "식물 키우기",
        description: "식물을 다음 단계로 성장시키세요",
        icon: "/characters/lala-happy.png",
        progress: getAchievementProgress("plant_grower"),
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableAchievements = getAvailableAchievements();
  const unlockedAchievements = achievements.filter((a) =>
    availableAchievements.some((av) => av.type === a.type)
  );

  // 달성한 업적 타입 목록
  const unlockedTypes = new Set(unlockedAchievements.map((a) => a.type));

  // 미달성 업적 (달성하지 않은 업적들)
  const uncompletedAchievements = availableAchievements.filter(
    (achievement) => !unlockedTypes.has(achievement.type)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">🏆 업적</h3>

      {/* 달성한 업적 */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 mb-2">✅ 달성</h4>
          <div className="space-y-2">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-2 relative"
              >
                <div className="absolute top-0.5 right-0.5 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                  ✓
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  {achievement.icon.startsWith("/") ? (
                    <img
                      src={achievement.icon}
                      alt="아이콘"
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="text-lg">{achievement.icon}</span>
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800 text-xs">
                      {achievement.title}
                    </h5>
                    <p className="text-xs text-gray-600 truncate">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-full"></div>
                </div>
                <div className="text-right text-xs text-green-600 mt-1">
                  완료
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미달성 업적 */}
      {uncompletedAchievements.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">📋 미달성</h4>
          <div className="space-y-2">
            {uncompletedAchievements.map((achievement) => (
              <div
                key={achievement.type}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2"
              >
                <div className="flex items-center space-x-2 mb-1">
                  {achievement.icon.startsWith("/") ? (
                    <img
                      src={achievement.icon}
                      alt="아이콘"
                      className="w-5 h-5 object-contain opacity-50"
                    />
                  ) : (
                    <span className="text-lg opacity-50">
                      {achievement.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-600 text-xs">
                      {achievement.title}
                    </h5>
                    <p className="text-xs text-gray-500 truncate">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {achievement.progress.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업적 통계 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">달성률</span>
          <span className="text-xs font-medium text-gray-800">
            {unlockedAchievements.length} / {availableAchievements.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-600 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${
                (unlockedAchievements.length / availableAchievements.length) *
                100
              }%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>✅ {unlockedAchievements.length}</span>
          <span>📋 {uncompletedAchievements.length}</span>
        </div>
      </div>
    </div>
  );
}
