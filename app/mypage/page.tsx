"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Link from "next/link";
import ThemeSelector from "../components/ThemeSelector";

interface UserProfile {
  id: number;
  email: string;
  nickname?: string;
  gender?: string;
  birth_date?: string;
  created_at: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const [editForm, setEditForm] = useState({
    nickname: "",
    gender: "",
    birthDate: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session) {
      fetchProfile();
      checkSubscription();
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm({
          nickname: data.profile.nickname || "",
          gender: data.profile.gender || "",
          birthDate: data.profile.birth_date || "",
        });
      }
    } catch (error) {
      console.error("프로필 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        console.log("마이페이지 구독 상태:", data);
        setIsPremium(data.isPremium);
      }
    } catch (error) {
      console.error("구독 상태 확인 오류:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      nickname: profile?.nickname || "",
      gender: profile?.gender || "",
      birthDate: profile?.birth_date || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        setSuccess("프로필이 성공적으로 수정되었습니다.");
      } else {
        const data = await response.json();
        setError(data.error || "프로필 수정에 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelSubscription = async () => {
    if (!confirm("정말로 구독을 취소하시겠습니까?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess("구독이 성공적으로 취소되었습니다.");
        setIsPremium(false);
        checkSubscription(); // 구독 상태 다시 확인
      } else {
        const data = await response.json();
        setError(data.error || "구독 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("구독 취소 오류:", error);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "male":
        return "남성";
      case "female":
        return "여성";
      default:
        return "미설정";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "미설정";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isPremium={isPremium} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-background">
      <Header isPremium={isPremium} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">마이페이지</h1>

          {/* 성공/오류 메시지 */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 프로필 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                프로필 정보
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
                >
                  수정
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="space-y-4">
                {/* 닉네임 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    닉네임
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={editForm.nickname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* 성별 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별
                  </label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">성별을 선택해주세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>

                {/* 생년월일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={editForm.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* 버튼 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">이메일</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">닉네임</span>
                  <span className="font-medium">
                    {profile?.nickname || "미설정"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">성별</span>
                  <span className="font-medium">
                    {getGenderText(profile?.gender || "")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">생년월일</span>
                  <span className="font-medium">
                    {formatDate(profile?.birth_date || "")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">가입일</span>
                  <span className="font-medium">
                    {formatDate(profile?.created_at || "")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 구독 관리 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              구독 관리
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">구독 상태</span>
                <span
                  className={`font-medium ${
                    isPremium ? "text-purple-600" : "text-gray-600"
                  }`}
                >
                  {isPremium ? "✨ Premium" : "무료"}
                </span>
              </div>

              <div className="pt-4 space-y-3">
                {isPremium ? (
                  <>
                    <Link
                      href="/payment"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center w-full text-sm"
                    >
                      구독 관리
                    </Link>
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer"
                    >
                      구독 취소하기
                    </button>
                  </>
                ) : (
                  <Link
                    href="/payment"
                    className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-center w-full"
                  >
                    Premium 구독하기
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 테마 설정 */}
          <ThemeSelector isPremium={isPremium} />

          {/* 계정 관리 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              계정 관리
            </h2>

            <div className="space-y-3">
              <Link
                href="/diary"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors text-center"
              >
                일기로 돌아가기
              </Link>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg transition-colors text-center"
              >
                📋 서비스 정책 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 정책 모달 */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  서비스 정책
                </h2>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 사업자 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    🏢 사업자 정보
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>상호명:</strong> 한줄일기
                    </p>
                    <p>
                      <strong>사업자등록번호:</strong> 123-45-67890
                    </p>
                    <p>
                      <strong>대표자명:</strong> 김재환
                    </p>
                    <p>
                      <strong>사업장주소:</strong> 백범로 124번길
                    </p>
                    <p>
                      <strong>간이과세자:</strong> 간이과세자
                    </p>
                  </div>
                </div>

                {/* 서비스 제공기간 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    📅 서비스 제공기간
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-4">
                    <p>• 월간 구독: 구독 시작일로부터 30일간</p>
                    <p>• 영구 구독: 구독 시작일로부터 무제한</p>
                    <p>• 구독 연장 시 자동 갱신</p>
                  </div>
                </div>

                {/* 환불 정책 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    💰 환불 정책
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-4">
                    <p>• 구독 후 3일 이내: 전액 환불 가능</p>
                    <p>• 3일 이후: 환불 불가</p>
                    <p>• 환불 요청: 마이페이지 → 구독 관리에서 가능</p>
                  </div>
                </div>

                {/* 취소 규정 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    ❌ 취소 규정
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-4">
                    <p>• 구독 취소: 언제든지 가능</p>
                    <p>• 취소 시: 다음 결제일부터 서비스 중단</p>
                    <p>• 이미 결제된 기간: 환불 정책에 따라 처리</p>
                    <p>• 취소 방법: 마이페이지 → 구독 취소하기</p>
                  </div>
                </div>

                {/* 교환 정책 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    🔄 교환 정책
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2 pl-4">
                    <p>• 디지털 서비스로 교환 불가</p>
                    <p>• 플랜 변경: 언제든지 가능</p>
                    <p>• 월간 → 영구: 차액 결제 후 업그레이드</p>
                    <p>• 영구 → 월간: 환불 후 재구독</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
