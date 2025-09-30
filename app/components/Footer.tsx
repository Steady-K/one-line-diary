"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium">상호명:</span> 한줄일기 | 
              <span className="font-medium"> 사업자등록번호:</span> 451-49-01017 | 
              <span className="font-medium"> 대표자명:</span> 김재환
            </p>
            <p>
              <span className="font-medium">사업장주소:</span> 인천광역시 남동구 백범로 124번길 | 
              <span className="font-medium"> 간이과세자</span>
            </p>
            <p className="text-gray-400">
              © 2024 한줄일기. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
