"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  isPremium: boolean;
}

export default function Header({ isPremium }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/diary" className="flex items-center space-x-1 sm:space-x-2">
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">한줄 일기</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isPremium && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                ✨ Premium
              </span>
            )}

            <Link
              href="/mypage"
              className="text-gray-600 hover:text-purple-500 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              마이페이지
            </Link>

            <button
              onClick={() => signOut()}
              className="text-gray-600 hover:text-purple-500 transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
