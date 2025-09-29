"use client";

interface AdBannerProps {
  isPremium: boolean;
}

export default function AdBanner({ isPremium }: AdBannerProps) {
  // 프리미엄 사용자는 광고를 보지 않음
  if (isPremium) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📢</div>
          <div>
            <h3 className="font-semibold text-lg">광고</h3>
            <p className="text-sm opacity-90">
              프리미엄으로 업그레이드하고 광고 없는 경험을 만나보세요!
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-75 mb-1">광고</div>
          <div className="text-sm font-medium">300x250</div>
        </div>
      </div>
    </div>
  );
}
