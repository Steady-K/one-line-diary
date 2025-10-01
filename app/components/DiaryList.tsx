"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Diary {
  id: number;
  content: string;
  emotion: string;
  mood: number;
  created_at: string;
  updated_at: string;
}

interface DiaryListProps {
  diaries: Diary[];
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  onDiaryUpdated: () => void;
  onTodayDiaryDeleted?: () => void; // 오늘 일기 삭제 알림 콜백
  isPremium: boolean;
}

export default function DiaryList({
  diaries,
  month,
  year,
  onMonthChange,
  onDiaryUpdated,
  onTodayDiaryDeleted,
  isPremium,
}: DiaryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleEdit = (diary: Diary) => {
    setEditingId(diary.id);
    setEditContent(diary.content);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (response.ok) {
        setEditingId(null);
        onDiaryUpdated();
      } else {
        const error = await response.json();
        alert(error.error || "일기 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("일기 수정 오류:", error);
      alert("일기 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "정말로 이 일기를 삭제하시겠습니까?\n삭제된 일기는 복구할 수 없습니다."
      )
    )
      return;

    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 삭제된 일기가 오늘 일기인지 확인
        const deletedDiary = diaries.find((diary) => diary.id === id);
        if (deletedDiary) {
          const today = new Date();
          const diaryDate = new Date(deletedDiary.created_at);

          // 같은 날인지 확인 (년, 월, 일 비교)
          const isTodayDiary =
            today.getFullYear() === diaryDate.getFullYear() &&
            today.getMonth() === diaryDate.getMonth() &&
            today.getDate() === diaryDate.getDate();

          if (isTodayDiary && onTodayDiaryDeleted) {
            console.log("DiaryList: 오늘 일기 삭제 감지, 알림 전송");
            onTodayDiaryDeleted(); // 오늘 일기 삭제 알림
          }
        }

        onDiaryUpdated();
        // 삭제 성공 메시지 (선택사항)
      } else {
        const error = await response.json();
        alert(error.error || "일기 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("일기 삭제 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  // 오늘 일기인지 확인하는 함수
  const isTodayDiary = (dateString: string) => {
    const today = new Date();
    const diaryDate = new Date(dateString);

    return (
      today.getFullYear() === diaryDate.getFullYear() &&
      today.getMonth() === diaryDate.getMonth() &&
      today.getDate() === diaryDate.getDate()
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          {year}년 {monthNames[month - 1]}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 일기 목록 */}
      {diaries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">아직 작성된 일기가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">
            첫 번째 일기를 작성해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {diaries.map((diary) => (
            <div
              key={diary.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{diary.emotion}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(diary.created_at)}
                    </span>
                    {isTodayDiary(diary.created_at) && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        오늘
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">기분:</span>
                      <span className="text-sm font-medium text-purple-600">
                        {diary.mood}/10
                      </span>
                    </div>
                  </div>

                  {editingId === diary.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        maxLength={200}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(diary.id)}
                          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 cursor-pointer"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed">
                      {diary.content}
                    </p>
                  )}
                </div>

                {!isPremium && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(diary)}
                      className="p-2 text-gray-400 hover:text-purple-500 transition-colors cursor-pointer"
                      title="수정"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
