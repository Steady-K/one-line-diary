#!/usr/bin/env node

// 테스트 계정 생성 스크립트
// 사용법: node create-test-accounts.js

const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/create-test-accounts`
  : 'http://localhost:3000/api/create-test-accounts';

async function createTestAccounts() {
  try {
    console.log('🧪 테스트 계정 생성 중...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 테스트 계정 생성 완료!');
      console.log('\n📋 생성된 테스트 계정들:');
      console.log('=' .repeat(50));
      
      data.accounts.forEach((account, index) => {
        if (account.success) {
          console.log(`\n${index + 1}. ${account.name} (${account.gender === 'male' ? '남성' : '여성'})`);
          console.log(`   이메일: ${account.email}`);
          console.log(`   비밀번호: ${account.password}`);
          console.log(`   생년월일: ${account.birth_date}`);
          console.log(`   사용자 ID: ${account.userId}`);
          console.log(`   구독 ID: ${account.subscriptionId}`);
        } else {
          console.log(`\n❌ ${account.email}: ${account.error}`);
        }
      });
      
      console.log('\n' + '='.repeat(50));
      console.log('💡 이제 이 계정들로 로그인하여 결제 테스트를 진행할 수 있습니다!');
      
    } else {
      console.error('❌ 테스트 계정 생성 실패:', data.error);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
createTestAccounts();
