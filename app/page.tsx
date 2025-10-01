import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/diary");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 theme-background">
      <div className="max-w-md w-full text-center">
        {/* 로고 */}
        <div className="mb-8">
          <div className="mb-4 animate-bounce flex justify-center">
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-8 h-8 object-contain mr-3"
            />
            한줄 일기
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-8 h-8 object-contain ml-3"
            />
          </h2>
          <p className="text-gray-600 text-lg">라라와 함께하는 특별한 일기</p>
        </div>

        {/* 버튼들 */}
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="lulu-btn w-full py-4 text-lg font-bold block transform hover:scale-105"
          >
            <span className="flex items-center justify-center">
              <img
                src="/characters/lala-happy.png"
                alt="라라"
                className="w-5 h-5 object-contain mr-2"
              />
              라라와 함께 시작하기
            </span>
          </Link>
          <Link
            href="/auth/signup"
            className="w-full bg-white border-2 border-yellow-400 text-yellow-600 py-4 px-6 rounded-xl font-bold hover:bg-yellow-50 transition-all block transform hover:scale-105 shadow-md"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2"></span>새 계정 만들기
            </span>
          </Link>
        </div>

        {/* 하단 텍스트 */}
        <p className="text-sm text-gray-500 mt-8">
          간단한 회원가입으로 시작하세요
        </p>
      </div>
    </div>
  );
}
