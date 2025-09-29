"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LalaCharacter from "./LalaCharacter";
import AdModal from "./AdModal";

interface DiaryFormProps {
  onDiaryAdded: () => void;
  onDiaryDeleted?: number; // 삭제 알림 트리거 (숫자)
  isPremium?: boolean; // 프리미엄 사용자 여부
  plantData?: {
    level: number;
    experience: number;
    type: string;
  }; // 식물 데이터
}

interface TodayDiary {
  id: number;
  content: string;
  emotion: string;
  mood: number;
  weather: string;
  created_at: string;
  updated_at: string;
}

export default function DiaryForm({
  onDiaryAdded,
  onDiaryDeleted,
  isPremium = false,
  plantData,
}: DiaryFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("😊");
  const [mood, setMood] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayDiary, setTodayDiary] = useState<TodayDiary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCheckingToday, setIsCheckingToday] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [lalaMessage, setLalaMessage] = useState("");

  // 감정별 이미지 매핑
  const emotionImages = {
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

  const emotions = ["😊", "😠", "😢", "😴", "😮", "🤔", "😍", "😎", "😅"];

  // 오늘 작성된 일기 확인
  useEffect(() => {
    if (session) {
      checkTodayDiary();
    }
  }, [session]);

  // 외부에서 삭제 알림을 받을 때 오늘 일기 상태 재확인
  useEffect(() => {
    console.log("DiaryForm: onDiaryDeleted 트리거 감지:", onDiaryDeleted);
    if (onDiaryDeleted !== undefined && onDiaryDeleted > 0) {
      console.log("DiaryForm: 오늘 일기 상태 재확인 시작");
      checkTodayDiary();
    }
  }, [onDiaryDeleted]);

  const checkTodayDiary = async () => {
    console.log("DiaryForm: checkTodayDiary 시작");
    try {
      const response = await fetch("/api/diary?today=true");
      if (response.ok) {
        const data = await response.json();
        console.log("DiaryForm: 오늘 일기 조회 결과:", data);
        if (data.hasTodayDiary) {
          setTodayDiary(data.diary);
          setContent(data.diary.content);
          setEmotion(data.diary.emotion);
          setMood(data.diary.mood);
          console.log("DiaryForm: 오늘 일기 있음, 상태 업데이트");
        } else {
          setTodayDiary(null);
          setContent("");
          setEmotion("😊");
          setMood(5);
          console.log("DiaryForm: 오늘 일기 없음, 상태 초기화");
        }
      }
    } catch (error) {
      console.error("오늘 일기 확인 오류:", error);
    } finally {
      setIsCheckingToday(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // 무료 사용자이고 오늘 일기가 없는 경우 광고 모달 표시
    if (!isPremium && !todayDiary) {
      setShowAdModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const url =
        isEditing && todayDiary ? `/api/diary/${todayDiary.id}` : "/api/diary";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          emotion,
          mood,
          weather: "🌞",
          isPrivate: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (isEditing) {
          // 수정 완료 시 수정 모드 해제
          setIsEditing(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          // 새 일기 작성 완료 시 - 작성 폼 숨기고 완료 메시지 표시
          setContent("");
          setMood(5);
          setEmotion("😊");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);

          // 새 업적 달성 알림
          if (result.newAchievements && result.newAchievements.length > 0) {
            result.newAchievements.forEach(
              (achievement: { title: string; description: string }) => {
                alert(
                  `🎉 새로운 업적 달성!\n${achievement.title}\n${achievement.description}`
                );
              }
            );
          }
        }
        onDiaryAdded();
        // 새 일기 작성 후 즉시 todayDiary 상태 업데이트
        if (!isEditing && result.diary) {
          setTodayDiary(result.diary);
          console.log(
            "DiaryForm: 새 일기 작성 완료, todayDiary 상태 업데이트:",
            result.diary
          );
        }
        // checkTodayDiary는 제거 - 이미 setTodayDiary로 상태 업데이트했으므로
      } else {
        const error = await response.json();
        // 삭제된 일기를 수정하려고 할 때의 처리
        if (
          error.error &&
          (error.error.includes("not found") ||
            error.error.includes("Diary not found"))
        ) {
          // 일기가 이미 삭제된 경우 상태 초기화
          setTodayDiary(null);
          setContent("");
          setMood(5);
          setEmotion("😊");
          setIsEditing(false);
          alert("일기가 이미 삭제되었습니다. 새로운 일기를 작성해주세요.");
        } else {
          alert(error.error || "일기 저장에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("일기 저장 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todayDiary) return;

    if (!confirm("정말로 오늘의 일기를 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/diary/${todayDiary.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 삭제 성공 시 즉시 상태 초기화하여 다시 작성 가능하게 함
        setTodayDiary(null);
        setContent("");
        setMood(5);
        setEmotion("😊");
        setIsEditing(false);

        // 성공 메시지 표시
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // 부모 컴포넌트에 변경사항 알림
        onDiaryAdded();
      } else {
        const error = await response.json();
        // 이미 삭제된 일기를 삭제하려고 할 때의 처리
        if (
          error.error &&
          (error.error.includes("not found") ||
            error.error.includes("Diary not found"))
        ) {
          // 일기가 이미 삭제된 경우 상태 초기화
          setTodayDiary(null);
          setContent("");
          setMood(5);
          setEmotion("😊");
          setIsEditing(false);
          alert("일기가 이미 삭제되었습니다.");
        } else {
          alert(`일기 삭제 실패: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("일기 삭제 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (todayDiary) {
      setContent(todayDiary.content);
      setEmotion(todayDiary.emotion);
      setMood(todayDiary.mood);
    }
  };

  const handleAdModalClose = () => {
    setShowAdModal(false);
  };

  const handleAdModalContinue = async () => {
    setShowAdModal(false);
    // 광고를 본 후 일기 작성 계속 진행
    setIsLoading(true);

    try {
      const url = "/api/diary";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          emotion,
          mood,
          weather: "🌞",
          isPrivate: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setContent("");
        setMood(5);
        setEmotion("😊");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // 새 업적 달성 알림
        if (result.newAchievements && result.newAchievements.length > 0) {
          result.newAchievements.forEach(
            (achievement: { title: string; description: string }) => {
              alert(
                `🎉 새로운 업적 달성!\n${achievement.title}\n${achievement.description}`
              );
            }
          );
        }
        onDiaryAdded();
        // 새 일기 작성 후 즉시 todayDiary 상태 업데이트
        if (result.diary) {
          setTodayDiary(result.diary);
          console.log(
            "DiaryForm: 새 일기 작성 완료, todayDiary 상태 업데이트:",
            result.diary
          );
        }
        // checkTodayDiary는 제거 - 이미 setTodayDiary로 상태 업데이트했으므로
      } else {
        const error = await response.json();
        alert(error.error || "일기 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("일기 저장 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToday) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* 라라 캐릭터 영역 */}
      <div className="lulu-card p-4 mb-6">
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
            <img
              src="/characters/lala-happy.png"
              alt="라라"
              className="w-6 h-6 object-contain mr-2"
            />
            오늘의 한줄 일기
          </h3>
          <p className="text-sm text-gray-600 text-center">
            오늘 하루의 소중한 순간을 한 줄로 기록해보세요
          </p>
        </div>

        {/* 라라 캐릭터와 정보를 좌우로 배치 */}
        <div className="flex items-center space-x-6">
          {/* 왼쪽: 라라 캐릭터 */}
          <div className="flex-shrink-0">
            <LalaCharacter
              emotion={emotion}
              level={Math.floor((todayDiary?.id || 0) / 10) + 1}
              experience={(todayDiary?.id || 0) * 5}
              onCharacterClick={() => {
                const messages = [
                  "오늘도 수고했어요! 🌟",
                  "일기 쓰는 모습이 예뻐요! ✨",
                  "오늘은 어떤 하루였나요? 😊",
                  "라라와 함께 일기를 써요! 💕",
                  "오늘도 좋은 하루 보내세요! 🌈",
                  "일기 쓰는 시간이 가장 행복해요! 🎉",
                  "오늘의 소중한 순간을 기록해요! 📝",
                  "라라가 응원할게요! 화이팅! 💪",
                ];
                const randomMessage =
                  messages[Math.floor(Math.random() * messages.length)];
                setLalaMessage(randomMessage);
                setTimeout(() => setLalaMessage(""), 5000);
              }}
            />
          </div>

          {/* 오른쪽: 라라 메시지 영역, 레벨, 경험치바 */}
          <div className="flex-1 space-y-3">
            {/* 라라 메시지 영역 - 항상 표시 */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-3 text-center">
              <p className="text-sm text-purple-700 font-medium">
                {lalaMessage || "라라를 클릭해보세요! 💕"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">레벨</span>
                <span className="text-sm font-medium text-purple-600">
                  Lv.{plantData?.level || 1}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(() => {
                      if (!plantData) return 0;
                      const plantStages = [
                        { level: 1, exp: 10 },
                        { level: 2, exp: 20 },
                        { level: 3, exp: 40 },
                        { level: 4, exp: 80 },
                        { level: 5, exp: 160 },
                        { level: 6, exp: 320 },
                        { level: 7, exp: 640 },
                      ];

                      const currentStage = plantStages.find(
                        (s) => s.level === plantData.level
                      );
                      if (!currentStage) return 0;

                      return (plantData.experience / currentStage.exp) * 100;
                    })()}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>다음 레벨까지</span>
                <span>
                  {(() => {
                    if (!plantData) return 10;
                    const plantStages = [
                      { level: 1, exp: 10 },
                      { level: 2, exp: 20 },
                      { level: 3, exp: 40 },
                      { level: 4, exp: 80 },
                      { level: 5, exp: 160 },
                      { level: 6, exp: 320 },
                      { level: 7, exp: 640 },
                    ];

                    const currentStage = plantStages.find(
                      (s) => s.level === plantData.level
                    );
                    if (!currentStage) return 10;

                    const remainingExp =
                      currentStage.exp - plantData.experience;
                    return remainingExp > 0 ? remainingExp : 0;
                  })()}{" "}
                  EXP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 일기 작성 영역 */}
      <div className="lulu-card p-6">
        {/* 디버깅: todayDiary 상태 확인 */}
        {(() => {
          console.log(
            "DiaryForm 렌더링 - todayDiary:",
            todayDiary,
            "isEditing:",
            isEditing
          );
          return null;
        })()}
        {/* 오늘 작성된 일기가 있는 경우 */}
        {todayDiary && !isEditing ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={
                      emotionImages[
                        todayDiary.emotion as keyof typeof emotionImages
                      ]
                    }
                    alt={todayDiary.emotion}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm text-gray-600">
                    {new Date(todayDiary.created_at).toLocaleTimeString(
                      "ko-KR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-gray-800 font-medium">{todayDiary.content}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  기분: {todayDiary.mood}/10
                </span>
                <span className="text-sm text-gray-500">
                  날씨: {todayDiary.weather}
                </span>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-gray-500 text-lg font-medium">
                오늘도 수고했어! 🌟
              </p>
              <p className="text-sm text-gray-400 mt-1">
                내일도 새로운 하루를 기록해보세요
              </p>
            </div>
          </div>
        ) : (
          /* 일기 작성 폼 */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 성공 메시지 */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium">
                  {isEditing
                    ? "일기가 수정되었습니다! ✨"
                    : "일기가 저장되었습니다! ✨"}
                </p>
              </div>
            )}

            {/* 일기 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘의 한줄
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루는 어땠나요?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
                disabled={isLoading}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/200
              </div>
            </div>

            {/* 감정 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="text-lg mr-2">💭</span>
                오늘의 감정을 선택해주세요
              </label>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                {emotions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEmotion(emoji)}
                    className={`
                    p-3 lg:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center cursor-pointer
                    ${
                      emotion === emoji
                        ? "bg-gradient-to-br from-yellow-200 to-orange-300 scale-105 ring-4 ring-yellow-400 shadow-lg"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg"
                    }
                  `}
                    disabled={isLoading}
                  >
                    <img
                      src={emotionImages[emoji as keyof typeof emotionImages]}
                      alt={emoji}
                      className="w-8 h-8 lg:w-10 lg:h-10 object-contain mb-1"
                    />
                    <span className="text-xs text-gray-600 font-medium">
                      {emoji === "😊" && "행복"}
                      {emoji === "😠" && "화남"}
                      {emoji === "😢" && "슬픔"}
                      {emoji === "😴" && "졸림"}
                      {emoji === "😮" && "황당"}
                      {emoji === "🤔" && "생각"}
                      {emoji === "😍" && "사랑"}
                      {emoji === "😎" && "멋짐"}
                      {emoji === "😅" && "당황"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 기분 점수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="text-lg mr-2">⭐</span>
                오늘의 기분 점수:{" "}
                <span className="text-yellow-600 font-bold">{mood}/10</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-1">
                  <img
                    src="/characters/lala-sad.png"
                    alt="슬픔"
                    className="w-4 h-4 object-contain"
                  />
                  <img
                    src="/characters/lala-thinking.png"
                    alt="보통"
                    className="w-4 h-4 object-contain"
                  />
                  <img
                    src="/characters/lala-happy.png"
                    alt="행복"
                    className="w-4 h-4 object-contain"
                  />
                  <img
                    src="/characters/lala-loving.png"
                    alt="매우 좋음"
                    className="w-4 h-4 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="lulu-btn flex-1 py-3 text-lg font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <img
                      src="/characters/lala-happy.png"
                      alt="라라"
                      className="w-5 h-5 object-contain mr-2 animate-spin"
                    />
                    저장 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">✨</span>
                    {isEditing ? "수정하기" : "저장하기"}
                  </span>
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all duration-300 font-medium cursor-pointer disabled:cursor-not-allowed"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* 광고 모달 */}
      <AdModal
        isOpen={showAdModal}
        onClose={handleAdModalClose}
        onContinue={handleAdModalContinue}
        isPremium={isPremium}
      />
    </div>
  );
}
