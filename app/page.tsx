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
  
  const currentMonth = new Date().toISOString().slice(0, 7); 

  useEffect(() => {
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

  const handleVote = async (status: Vote['status']) => {
    if (!name.trim()) return alert('먼저 이름을 입력해주세요! 👆');
    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status }),
      });
      
      if (!res.ok) throw new Error('API Error');
      
      setData(await res.json());
      alert('투표가 반영되었습니다! 👌');
    } catch (err) {
      console.error(err);
      alert('투표 저장에 실패했어요. 인터넷 연결을 확인해주세요 ㅠㅠ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (status: 'paid' | 'rest') => {
    if (!name) return alert('먼저 이름을 입력해주세요! 👆');
    
    const msg = status === 'paid' 
      ? `${name}님, ${currentMonth}월 회비 입금 확인 요청을 남길까요?`
      : `${name}님, ${currentMonth}월은 쉬어가시나요? (회비 없음)`;
      
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status, month: currentMonth }),
      });
      setData(await res.json());
      alert('반영되었습니다! 🎉');
    } catch (err) {
      alert('요청 실패 ㅠㅠ');
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => handleVote('attendance')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'attendance' ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              참석 🙆‍♂️
            </button>
            <button
              onClick={() => handleVote('absence')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'absence' ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600' : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              불참 🙅‍♂️
            </button>
            <button
              onClick={() => handleVote('undecided')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'undecided' ? 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              미정 🤔
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500">참석자 명단</h3>
            <div className="flex flex-wrap gap-2">
              {data.votes.filter((v) => v.status === 'attendance').map((v) => (
                <span key={v.name} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{v.name}</span>
              ))}
              {data.votes.filter((v) => v.status === 'attendance').length === 0 && (
                <span className="text-gray-400 text-sm">아직 아무도 없어요...</span>
              )}
            </div>
          </div>
          
          {/* 라인업 바로가기 */}
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
                onClick={() => handleDeposit('paid')}
                disabled={loading}
                className={`py-3 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  myDepositStatus === 'paid'
                    ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600'
                    : 'border-2 border-green-500 text-green-600 hover:bg-green-50'
                }`}
              >
                ✅ 입금 완료
              </button>
              
              <button
                onClick={() => handleDeposit('rest')}
                disabled={loading}
                className={`py-3 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  myDepositStatus === 'rest'
                    ? 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600'
                    : 'border-2 border-gray-400 text-gray-600 hover:bg-gray-50'
                }`}
              >
                💤 이번 달 휴식
              </button>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">이번 달 현황 ({thisMonthDeposits.length}명)</h3>
            <ul className="space-y-1">
              {thisMonthDeposits.map((d, i) => (
                <li key={i} className={`flex justify-between text-sm p-2 rounded ${d.status === 'paid' ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <span className={`font-medium ${d.status === 'paid' ? 'text-green-800' : 'text-gray-600'}`}>
                    {d.name} {d.status === 'rest' && '(휴식)'}
                  </span>
                  <span className={d.status === 'paid' ? 'text-green-600' : 'text-gray-400'}>
                    {d.status === 'paid' ? '10,000원' : '-'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
