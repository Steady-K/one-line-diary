// 테마 타입 정의
export type Theme = 'default' | 'spring' | 'summer' | 'autumn' | 'winter';

// 테마 설정 인터페이스
export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    gradient: string;
  };
  description: string;
}

// 테마 설정들
export const themes: Record<Theme, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: '기본 테마',
    colors: {
      primary: '#8B5CF6', // purple-500
      secondary: '#EC4899', // pink-500
      background: '#F9FAFB', // gray-50
      surface: '#FFFFFF',
      text: '#1F2937', // gray-800
      accent: '#F3F4F6', // gray-100
      gradient: 'from-purple-500 to-pink-500',
    },
    description: '라라와 함께하는 기본 테마',
  },
  spring: {
    name: 'spring',
    displayName: '봄 테마',
    colors: {
      primary: '#10B981', // emerald-500
      secondary: '#F59E0B', // amber-500
      background: '#F0FDF4', // green-50
      surface: '#FFFFFF',
      text: '#1F2937',
      accent: '#D1FAE5', // emerald-100
      gradient: 'from-emerald-400 to-green-300',
    },
    description: '싱그러운 봄의 느낌',
  },
  summer: {
    name: 'summer',
    displayName: '여름 테마',
    colors: {
      primary: '#3B82F6', // blue-500
      secondary: '#F59E0B', // amber-500
      background: '#EFF6FF', // blue-50
      surface: '#FFFFFF',
      text: '#1F2937',
      accent: '#DBEAFE', // blue-100
      gradient: 'from-blue-400 to-cyan-300',
    },
    description: '시원한 여름의 느낌',
  },
  autumn: {
    name: 'autumn',
    displayName: '가을 테마',
    colors: {
      primary: '#F59E0B', // amber-500
      secondary: '#EF4444', // red-500
      background: '#FFFBEB', // amber-50
      surface: '#FFFFFF',
      text: '#1F2937',
      accent: '#FEF3C7', // amber-100
      gradient: 'from-amber-500 to-orange-400',
    },
    description: '따뜻한 가을의 느낌',
  },
  winter: {
    name: 'winter',
    displayName: '겨울 테마',
    colors: {
      primary: '#6366F1', // indigo-500
      secondary: '#8B5CF6', // purple-500
      background: '#F8FAFC', // slate-50
      surface: '#FFFFFF',
      text: '#1F2937',
      accent: '#E2E8F0', // slate-200
      gradient: 'from-indigo-400 to-purple-300',
    },
    description: '차분한 겨울의 느낌',
  },
};

// 테마 적용 함수
export function applyTheme(theme: Theme) {
  const themeConfig = themes[theme];
  const root = document.documentElement;
  
  // CSS 변수로 테마 색상 적용
  root.style.setProperty('--theme-primary', themeConfig.colors.primary);
  root.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
  root.style.setProperty('--theme-background', themeConfig.colors.background);
  root.style.setProperty('--theme-surface', themeConfig.colors.surface);
  root.style.setProperty('--theme-text', themeConfig.colors.text);
  root.style.setProperty('--theme-accent', themeConfig.colors.accent);
  root.style.setProperty('--theme-gradient', themeConfig.colors.gradient);
  
  // 테마 클래스 추가/제거
  root.className = root.className.replace(/theme-\w+/g, '');
  root.classList.add(`theme-${theme}`);
  
  // 로컬 스토리지에 저장
  localStorage.setItem('selectedTheme', theme);
}

// 저장된 테마 불러오기
export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'default';
  
  const savedTheme = localStorage.getItem('selectedTheme') as Theme;
  return savedTheme && themes[savedTheme] ? savedTheme : 'default';
}

// 테마 초기화
export function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  const theme = loadTheme();
  applyTheme(theme);
}

// 구독 상태에 따른 테마 리셋
export function resetThemeIfNotPremium(isPremium: boolean) {
  if (typeof window === 'undefined') return;
  
  const currentTheme = loadTheme();
  
  // 프리미엄이 아니고 기본 테마가 아닌 경우 기본 테마로 리셋
  if (!isPremium && currentTheme !== 'default') {
    applyTheme('default');
    console.log('구독이 만료되어 기본 테마로 변경되었습니다.');
  }
}
