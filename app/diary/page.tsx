"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import DiaryForm from "../components/DiaryForm";
import DiaryList from "../components/DiaryList";
import StatsChart from "../components/StatsChart";
import PremiumBanner from "../components/PremiumBanner";
import PlantGrowth from "../components/PlantGrowth";
import AchievementSystem from "../components/AchievementSystem";
import Header from "../components/Header";
import AdBanner from "../components/AdBanner";
import ProfileSetup from "../components/ProfileSetup";

function DiaryPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [diaries, setDiaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [diaryDeletedTrigger, setDiaryDeletedTrigger] = useState(0);
  const [plantData, setPlantData] = useState<{
    level: number;
    experience: number;
    type: string;
  } | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const fetchDiaries = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/diary?month=${currentMonth}&year=${currentYear}`
      );
      const data = await response.json();
      setDiaries(data.diaries || []);
    } catch (error) {
      console.error("일기 목록 조회 오류:", error);
    }
  }, [currentMonth, currentYear]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/stats?month=${currentMonth}&year=${currentYear}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("통계 조회 오류:", error);
    }
  }, [currentMonth, currentYear]);

  const checkSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch("/api/subscription");
      const data = await response.json();
      console.log("DiaryPage: 구독 상태 확인:", data);
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error("구독 상태 조회 오류:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  // 구독 상태 강제 새로고침 (결제 완료 후 호출)
  const refreshSubscriptionStatus = useCallback(async () => {
    await checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      checkProfileSetup();
      fetchDiaries();
      fetchStats();
      checkSubscription();
      fetchPlantData();
    }
  }, [
    session,
    currentMonth,
    currentYear,
    fetchDiaries,
    fetchStats,
    checkSubscription,
  ]);

  // 결제 완료 후 프리미엄 상태 확인
  useEffect(() => {
    const isPremiumParam = searchParams.get("premium");
    if (isPremiumParam === "true") {
      // 구독 상태 강제 새로고침
      refreshSubscriptionStatus();
      // URL에서 파라미터 제거
      router.replace("/diary");
    }
  }, [searchParams, router, refreshSubscriptionStatus]);

  // 일기 추가 후 모든 데이터 새로고침
  const handleDiaryAdded = async () => {
    await Promise.all([
      fetchDiaries(),
      fetchStats(),
      checkSubscription(),
      fetchPlantData(),
    ]);
    setRefreshTrigger((prev) => prev + 1); // PlantGrowth 컴포넌트 새로고침 트리거
  };

  // 식물 데이터 조회
  const fetchPlantData = async () => {
    try {
      const response = await fetch("/api/plant");
      if (response.ok) {
        const data = await response.json();
        setPlantData(data.plant);
      }
    } catch (error) {
      console.error("식물 데이터 조회 오류:", error);
    }
  };

  const checkProfileSetup = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);

        // 프로필이 완전하지 않으면 설정 창 표시
        if (
          !data.profile.nickname ||
          !data.profile.gender ||
          !data.profile.birth_date
        ) {
          setShowProfileSetup(true);
        }
      }
    } catch (error) {
      console.error("프로필 확인 오류:", error);
    }
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    checkProfileSetup(); // 프로필 다시 확인
  };

  // 오늘 일기 삭제 알림
  const handleTodayDiaryDeleted = () => {
    console.log("DiaryPage: 오늘 일기 삭제 알림 수신, 트리거 증가");
    setDiaryDeletedTrigger((prev) => prev + 1); // DiaryForm 컴포넌트 새로고침 트리거
  };

  if (status === "loading" || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header isPremium={isPremium} />

      <div className="container mx-auto px-4 py-8">
        {/* 프리미엄 배너 */}
        {!isPremium && <PremiumBanner />}

        {/* 광고 배너 */}
        <AdBanner isPremium={isPremium} />

        {/* 메인 콘텐츠 영역 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 일기 작성 폼 - 왼쪽 2/3 */}
          <div className="lg:col-span-2">
            <DiaryForm
              onDiaryAdded={handleDiaryAdded}
              onDiaryDeleted={diaryDeletedTrigger}
              isPremium={isPremium}
              plantData={plantData || undefined}
            />
          </div>

          {/* 게임화 요소들 - 오른쪽 1/3 */}
          <div className="space-y-6">
            <PlantGrowth
              onLevelUp={handleDiaryAdded}
              refreshTrigger={refreshTrigger}
            />
            <AchievementSystem refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* 통계 차트 */}
        {stats && <StatsChart stats={stats} isPremium={isPremium} />}

        {/* 일기 목록 */}
        <DiaryList
          diaries={diaries}
          month={currentMonth}
          year={currentYear}
          onMonthChange={(month, year) => {
            setCurrentMonth(month);
            setCurrentYear(year);
          }}
          onDiaryUpdated={handleDiaryAdded}
          onTodayDiaryDeleted={handleTodayDiaryDeleted}
          isPremium={isPremium}
        />

        {/* 프로필 설정 모달 */}
        {showProfileSetup && (
          <ProfileSetup onComplete={handleProfileSetupComplete} />
        )}
      </div>
    </div>
  );
}

export default function DiaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <DiaryPageContent />
    </Suspense>
  );
}
