"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

export default function TestSessionManager() {
  const [isTestMode, setIsTestMode] = useState(false);

  const handleTestLogin = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'test123',
        redirect: false,
      });

      if (result?.ok) {
        setIsTestMode(true);
        alert('테스트 계정으로 로그인되었습니다!\n\n프리미엄 구독자로 마이페이지에서 테마 기능을 테스트할 수 있습니다.');
      } else {
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('테스트 로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleTestLogout = async () => {
    try {
      await signOut({ redirect: false });
      setIsTestMode(false);
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          🧪 테스트 모드
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={handleTestLogin}
            disabled={isTestMode}
            className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
              isTestMode
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isTestMode ? '✅ 테스트 계정 로그인됨' : '프리미엄 구독자로 로그인'}
          </button>
          
          <button
            onClick={handleTestLogout}
            disabled={!isTestMode}
            className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
              !isTestMode
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            로그아웃
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <p><strong>테스트 계정:</strong></p>
          <p>이메일: test@example.com</p>
          <p>비밀번호: test123</p>
          <p>구독: 프리미엄 (활성)</p>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <p>💡 마이페이지에서 테마 기능을 테스트하세요!</p>
        </div>
      </div>
    </div>
  );
}
