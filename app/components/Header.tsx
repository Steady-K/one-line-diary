"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  isPremium: boolean;
}

export default function Header({ isPremium }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/diary" className="flex items-center space-x-2">
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">한줄 일기</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isPremium && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                ✨ Premium
              </span>
            )}

            <Link
              href="/mypage"
              className="text-gray-600 hover:text-purple-500 transition-colors"
            >
              마이페이지
            </Link>

            <button
              onClick={() => signOut()}
              className="text-gray-600 hover:text-purple-500 transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
