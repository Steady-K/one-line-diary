"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface StatsChartProps {
  stats: {
    emotionStats: Record<string, number>;
    moodStats: {
      average: number;
      min: number;
      max: number;
    };
    dailyMood: Array<{
      date: string;
      mood: number;
      emotion: string;
    }>;
    streak: number;
    totalEntries: number;
    monthEntries: number;
  };
  isPremium: boolean;
}

export default function StatsChart({ stats, isPremium }: StatsChartProps) {
  if (!stats || !stats.emotionStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          📊 통계 데이터 로딩 중...
        </h3>
        <div className="text-center text-gray-500 py-8">
          통계 데이터를 불러오고 있습니다.
        </div>
      </div>
    );
  }

  // 감정별 이미지 매핑
  const emotionImages: Record<string, string> = {
    "😊": "/characters/lala-happy.png",
    "😠": "/characters/lala-angry.png",
    "😢": "/characters/lala-sad.png",
    "😴": "/characters/lala-sleepy.png",
    "😮": "/characters/lala-surprised.png",
    "🤔": "/characters/lala-thinking.png",
    "😍": "/characters/lala-loving.png",
    "😎": "/characters/lala-cool.png",
    "😅": "/characters/lala-embarrassed.png",
  };

  // 감정 통계 데이터 변환 (안전하게)
  const emotionData = stats.emotionStats
    ? Object.entries(stats.emotionStats).map(([emotion, count]) => ({
        emotion,
        count,
        image: emotionImages[emotion] || "/characters/lala-happy.png",
      }))
    : [];

  // 일별 기분 데이터 변환 (최근 30일) - 안전하게
  const dailyMoodData = stats.dailyMood
    ? stats.dailyMood.slice(-30).map((item) => ({
        date: new Date(item.date).getDate(),
        mood: item.mood,
      }))
    : [];

  if (!isPremium && stats.monthEntries > 7) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">📊 프리미엄 통계</h3>
            <p className="text-purple-100">
              더 자세한 통계와 분석을 보고 싶으시다면 프리미엄을 구독해보세요!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.monthEntries}</div>
            <div className="text-purple-100">이번 달 일기</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        📊 이번 달 통계
      </h3>

      {/* 기본 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.monthEntries}
          </div>
          <div className="text-sm text-gray-600">이번 달 일기</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{stats.streak}</div>
          <div className="text-sm text-gray-600">연속 작성일</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalEntries}
          </div>
          <div className="text-sm text-gray-600">총 일기 수</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.moodStats.average}
          </div>
          <div className="text-sm text-gray-600">평균 기분</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 감정별 통계 */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            감정별 분포
          </h4>
          {emotionData.length > 0 ? (
            <div className="space-y-3">
              {emotionData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.image}
                    alt={item.emotion}
                    className="w-8 h-8 object-contain"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.emotion}
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {item.count}회
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...emotionData.map((d) => d.count))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              아직 충분한 데이터가 없습니다
            </div>
          )}
        </div>

        {/* 일별 기분 추이 */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            기분 변화 추이
          </h4>
          {dailyMoodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyMoodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">
              아직 충분한 데이터가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
