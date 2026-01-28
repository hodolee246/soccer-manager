'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Vote = {
  name: string;
  status: 'attendance' | 'absence' | 'undecided';
};

type Deposit = {
  name: string;
  amount: number;
  month: string;
  status: 'paid' | 'rest';
  timestamp: number;
};

type DBData = {
  votes: Vote[];
  deposits: Deposit[];
};

export default function Home() {
  const [name, setName] = useState('');
  const [data, setData] = useState<DBData>({ votes: [], deposits: [] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const currentMonth = new Date().toISOString().slice(0, 7); 

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem('soccer_user_name');
    if (savedName) setName(savedName);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/status');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  const saveName = (inputName: string) => {
    setName(inputName);
    localStorage.setItem('soccer_user_name', inputName);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000); // 3초 후 사라짐
  };

  const handleVote = async (status: Vote['status']) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showMessage('이름을 먼저 입력해주세요! 👆', 'error');
      return;
    }
    
    saveName(trimmedName);
    setLoading(true);
    
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, status }),
      });
      
      if (!res.ok) throw new Error('API Error');
      
      const updated = await res.json();
      setData(updated);
      showMessage('투표가 저장되었습니다! 👌', 'success');
    } catch (err) {
      console.error(err);
      showMessage('저장에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (status: 'paid' | 'rest') => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showMessage('이름을 먼저 입력해주세요! 👆', 'error');
      return;
    }
    
    saveName(trimmedName); // 이름 저장 보장

    // window.confirm 대신 커스텀 UI를 쓰면 좋겠지만, 일단 간단히 진행
    // 만약 confirm이 차단된다면 바로 진행되도록 수정 고려 (일단은 confirm 유지하되 로그 추가)
    if (!confirm(`${trimmedName}님, ${status === 'paid' ? '입금 확인 요청' : '휴식'} 처리하시겠습니까?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, status, month: currentMonth }),
      });
      
      if (!res.ok) throw new Error('API Error');

      const updated = await res.json();
      setData(updated);
      showMessage('처리가 완료되었습니다! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showMessage('요청 실패. 다시 시도해주세요.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 하이드레이션 오류 방지
  if (!mounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">⚽️ 로딩 중...</div>;

  const attendanceCount = data.votes.filter((v) => v.status === 'attendance').length;
  const myVote = data.votes.find((v) => v.name === name)?.status;
  const thisMonthDeposits = data.deposits.filter(d => d.month === currentMonth);
  const myDepositStatus = thisMonthDeposits.find(d => d.name === name)?.status;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-900">⚽️ 원패스 FC</h1>
        <p className="text-gray-600">이번 주 경기 참석하시나요?</p>
      </header>

      {/* 알림 메시지 (Toast) */}
      {msg && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 text-white font-bold animate-bounce ${msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {msg.text}
        </div>
      )}

      <main className="mx-auto max-w-md space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">내 이름 (닉네임)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => saveName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800 flex justify-between items-center">
            <span>📅 이번 주 경기</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{attendanceCount}명 참석</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleVote('attendance')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition active:scale-95 ${
                myVote === 'attendance' ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              참석 🙆‍♂️
            </button>
            <button
              type="button"
              onClick={() => handleVote('absence')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition active:scale-95 ${
                myVote === 'absence' ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600' : 'bg-red-100 text-red-600 hover:bg-red-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              불참 🙅‍♂️
            </button>
            <button
              type="button"
              onClick={() => handleVote('undecided')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition active:scale-95 ${
                myVote === 'undecided' ? 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              미정 🤔
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500">참석자 명단</h3>
            <div className="flex flex-wrap gap-2">
              {data.votes.filter((v) => v.status === 'attendance').map((v) => (
                <div key={v.name} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 group relative">
                  <span>{v.name}</span>
                  {/* 삭제 버튼 (본인 이름일 때만 표시하도록 할 수도 있지만, 일단 누구나 삭제 가능하게) */}
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`'${v.name}' 님의 참석을 취소하시겠습니까?`)) return;
                      await fetch(`/api/vote?name=${encodeURIComponent(v.name)}`, { method: 'DELETE' });
                      fetchData();
                    }}
                    className="w-4 h-4 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              {data.votes.filter((v) => v.status === 'attendance').length === 0 && (
                <span className="text-gray-400 text-sm">아직 아무도 없어요...</span>
              )}
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <Link href="/lineup" className="block w-full text-center bg-green-50 py-3 rounded-lg text-green-700 font-bold hover:bg-green-100 transition border border-green-200">
              📋 라인업 짜러 가기 →
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800 flex justify-between items-center">
            <span>💰 {parseInt(currentMonth.split('-')[1])}월 회비</span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {thisMonthDeposits.filter(d => d.status === 'paid').length}명 납부
            </span>
          </h2>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
              <span className="text-gray-700">이번 달 회비</span>
              <span className="font-bold text-blue-900">10,000원</span>
            </div>
            
            <a
              href="https://toss.me/hodolee246" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg bg-blue-100 py-3 text-blue-700 font-bold hover:bg-blue-200 active:bg-blue-300 transition flex items-center justify-center gap-2"
            >
              <span>💸 토스로 송금하기</span>
            </a>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDeposit('paid')}
                disabled={loading}
                className={`py-3 rounded-lg font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                  myDepositStatus === 'paid'
                    ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600'
                    : 'border-2 border-green-500 text-green-600 hover:bg-green-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ✅ 입금 완료
              </button>
              
              <button
                type="button"
                onClick={() => handleDeposit('rest')}
                disabled={loading}
                className={`py-3 rounded-lg font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                  myDepositStatus === 'rest'
                    ? 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600'
                    : 'border-2 border-gray-400 text-gray-600 hover:bg-gray-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                💤 이번 달 휴식
              </button>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">이번 달 현황 ({thisMonthDeposits.length}명)</h3>
            <ul className="space-y-1">
              {thisMonthDeposits.map((d, i) => (
                <li key={i} className={`flex justify-between text-sm p-2 rounded ${d.status === 'paid' ? 'bg-green-50' : 'bg-gray-100'} group relative`}>
                  <span className={`font-medium ${d.status === 'paid' ? 'text-green-800' : 'text-gray-600'}`}>
                    {d.name} {d.status === 'rest' && '(휴식)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={d.status === 'paid' ? 'text-green-600' : 'text-gray-400'}>
                      {d.status === 'paid' ? '10,000원' : '-'}
                    </span>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`'${d.name}' 님의 입금/휴식 기록을 삭제하시겠습니까?`)) return;
                        await fetch(`/api/deposit?name=${encodeURIComponent(d.name)}&month=${currentMonth}`, { method: 'DELETE' });
                        fetchData();
                      }}
                      className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
