'use client';

import { useState, useEffect } from 'react';

type Vote = {
  name: string;
  status: 'attendance' | 'absence' | 'undecided';
};

type Deposit = {
  name: string;
  amount: number;
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

  // 초기 데이터 로드 & 로컬스토리지 이름 로드
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
    if (!name) {
      alert('먼저 이름을 입력해주세요! 👆');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status }),
      });
      const updated = await res.json();
      setData(updated);
    } catch (err) {
      alert('투표 실패 ㅠㅠ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!name) {
      alert('먼저 이름을 입력해주세요! 👆');
      return;
    }
    if (!confirm(`${name}님 이름으로 입금 확인 요청을 남길까요?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const updated = await res.json();
      setData(updated);
      alert('입금 확인 요청 완료! 🎉');
    } catch (err) {
      alert('요청 실패 ㅠㅠ');
    } finally {
      setLoading(false);
    }
  };

  const attendanceCount = data.votes.filter((v) => v.status === 'attendance').length;
  
  // 내 투표 상태
  const myVote = data.votes.find((v) => v.name === name)?.status;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-900">⚽️ 원패스 FC</h1>
        <p className="text-gray-600">이번 주 경기 참석하시나요?</p>
      </header>

      <main className="mx-auto max-w-md space-y-6">
        {/* 이름 입력 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내 이름 (닉네임)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => saveName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* 투표 섹션 */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800 flex justify-between items-center">
            <span>📅 이번 주 경기</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {attendanceCount}명 참석
            </span>
          </h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleVote('attendance')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'attendance'
                  ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              참석 🙆‍♂️
            </button>
            <button
              onClick={() => handleVote('absence')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'absence'
                  ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              불참 🙅‍♂️
            </button>
            <button
              onClick={() => handleVote('undecided')}
              disabled={loading}
              className={`py-3 rounded-lg font-bold transition ${
                myVote === 'undecided'
                  ? 'bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              미정 🤔
            </button>
          </div>

          {/* 투표 현황 리스트 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500">참석자 명단</h3>
            <div className="flex flex-wrap gap-2">
              {data.votes
                .filter((v) => v.status === 'attendance')
                .map((v) => (
                  <span key={v.name} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {v.name}
                  </span>
                ))}
              {data.votes.filter((v) => v.status === 'attendance').length === 0 && (
                <span className="text-gray-400 text-sm">아직 아무도 없어요...</span>
              )}
            </div>
          </div>
        </div>

        {/* 회비 섹션 */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">💰 회비 납부</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
              <span className="text-gray-700">이번 주 회비</span>
              <span className="font-bold text-blue-900">10,000원</span>
            </div>
            
            <a
              href="https://toss.me/hodolee246" // 일단 임시 링크
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg bg-blue-100 py-4 text-blue-700 font-bold hover:bg-blue-200 active:bg-blue-300 transition flex items-center justify-center gap-2"
            >
              <span>💸 토스로 송금하기</span>
            </a>
            
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full rounded-lg border-2 border-green-500 py-3 text-green-600 font-bold hover:bg-green-50 active:bg-green-100 transition"
            >
              ✅ 입금 완료했어요!
            </button>
          </div>

          {/* 입금자 리스트 */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">입금 확인됨 ({data.deposits.length}명)</h3>
            <ul className="space-y-1">
              {data.deposits.map((d, i) => (
                <li key={i} className="flex justify-between text-sm p-2 bg-green-50 rounded">
                  <span className="font-medium text-green-800">{d.name}</span>
                  <span className="text-green-600">10,000원</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
