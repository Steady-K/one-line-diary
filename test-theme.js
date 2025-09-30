// 개발자 도구에서 테마 테스트용 스크립트
// 브라우저 콘솔에서 실행하세요

// 테마 변경 함수
function changeTheme(theme) {
  const themes = {
    default: "기본 테마",
    spring: "봄 테마",
    summer: "여름 테마",
    autumn: "가을 테마",
    winter: "겨울 테마",
  };

  // 테마 적용
  const root = document.documentElement;
  root.className = root.className.replace(/theme-\w+/g, "");
  root.classList.add(`theme-${theme}`);

  // 로컬 스토리지에 저장
  localStorage.setItem("selectedTheme", theme);

  console.log(`✅ ${themes[theme]} 적용됨`);
}

// 사용법:
// changeTheme('spring')  - 봄 테마
// changeTheme('summer')  - 여름 테마
// changeTheme('autumn')  - 가을 테마
// changeTheme('winter')  - 겨울 테마
// changeTheme('default') - 기본 테마

console.log("🎨 테마 테스트 스크립트 로드됨");
console.log('사용법: changeTheme("spring") 등으로 테마 변경');
