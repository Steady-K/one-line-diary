"use client";

import { useState, useEffect } from "react";
import { themes, Theme, applyTheme, loadTheme, resetThemeIfNotPremium } from "@/lib/theme";

interface ThemeSelectorProps {
  isPremium: boolean;
}

export default function ThemeSelector({ isPremium }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 저장된 테마 불러오기
    const savedTheme = loadTheme();
    setSelectedTheme(savedTheme);
    
    // 구독 상태에 따른 테마 리셋
    resetThemeIfNotPremium(isPremium);
  }, [isPremium]);

  const handleThemeChange = async (theme: Theme) => {
    if (!isPremium) {
      alert('테마 변경은 프리미엄 구독자만 이용할 수 있습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 테마 적용
      applyTheme(theme);
      setSelectedTheme(theme);
      
      // 서버에 테마 설정 저장 (선택사항)
      const response = await fetch('/api/user/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        console.error('테마 저장 실패');
      }
    } catch (error) {
      console.error('테마 변경 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🎨 테마 설정
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">
            테마 변경은 프리미엄 구독자만 이용할 수 있습니다.
          </p>
          <a
            href="/payment"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            프리미엄 구독하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🎨 테마 설정
      </h2>
      <p className="text-gray-600 mb-6">
        원하는 테마를 선택하여 앱의 색상을 변경할 수 있습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(themes).map(([key, theme]) => (
          <div
            key={key}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedTheme === key
                ? 'border-purple-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleThemeChange(key as Theme)}
          >
            {selectedTheme === key && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}

            {/* 테마 미리보기 */}
            <div className="mb-3">
              <div
                className={`h-16 rounded-lg bg-gradient-to-r ${theme.colors.gradient} mb-2`}
              ></div>
              <div className="flex space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.colors.secondary }}
                ></div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                ></div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-1">
              {theme.displayName}
            </h3>
            <p className="text-sm text-gray-600">{theme.description}</p>

            {isLoading && selectedTheme === key && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">💡</span>
          <p className="text-sm text-blue-700">
            테마는 즉시 적용되며, 브라우저에 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
