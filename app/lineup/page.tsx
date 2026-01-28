'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Vote = {
  name: string;
  status: 'attendance' | 'absence' | 'undecided';
};

// 포메이션 타입 정의
type FormationType = '4-3-3' | '4-2-1-3';

const formations = {
  '4-3-3': {
    FW: 3,
    MF: 3,
    DF: 4,
    GK: 1
  },
  '4-2-1-3': {
    FW: 3,
    AMF: 1,
    DMF: 2,
    DF: 4,
    GK: 1
  }
};

export default function LineupPage() {
  const [players, setPlayers] = useState<string[]>([]);
  // 선택된 포메이션에 따라 필드 구성
  const [currentFormation, setCurrentFormation] = useState<FormationType>('4-3-3');
  
  // 포지션별 배치 상태
  const [lineup, setLineup] = useState<{ [key: string]: string[] }>({
    FW: [],
    MF: [],
    AMF: [],
    DMF: [],
    DF: [],
    GK: [],
  });
  
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/status');
      const json = await res.json();
      const attendees = json.votes
        .filter((v: Vote) => v.status === 'attendance')
        .map((v: Vote) => v.name);
      setPlayers(attendees);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (name: string) => {
    setDraggedPlayer(name);
  };

  const handleDrop = (zone: string) => {
    if (!draggedPlayer) return;

    // 1. 기존 위치에서 제거
    const newPlayers = players.filter(p => p !== draggedPlayer);
    const newLineup = { ...lineup };
    Object.keys(newLineup).forEach(key => {
      newLineup[key] = newLineup[key].filter(p => p !== draggedPlayer);
    });

    // 2. 새 위치에 추가
    if (zone === 'bench') {
      newPlayers.push(draggedPlayer);
    } else {
      newLineup[zone].push(draggedPlayer);
    }

    setPlayers(newPlayers);
    setLineup(newLineup);
    setDraggedPlayer(null);
  };

  // 현재 포메이션에 맞는 포지션 리스트 반환
  const getPositionLayout = () => {
    if (currentFormation === '4-3-3') {
      return ['FW', 'MF', 'DF', 'GK'];
    }
    return ['FW', 'AMF', 'DMF', 'DF', 'GK'];
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-blue-600 font-bold text-sm">← 홈으로</Link>
        <h1 className="text-lg font-bold text-green-900">📋 라인업</h1>
        <div className="w-14"></div> 
      </header>

      <main className="mx-auto max-w-md space-y-4">
        
        {/* 포메이션 선택 버튼 */}
        <div className="flex justify-center gap-2 mb-4">
          <button 
            onClick={() => setCurrentFormation('4-3-3')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${currentFormation === '4-3-3' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200'}`}
          >
            4-3-3
          </button>
          <button 
            onClick={() => setCurrentFormation('4-2-1-3')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${currentFormation === '4-2-1-3' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200'}`}
          >
            4-2-1-3
          </button>
        </div>

        {/* 그라운드 (드롭존) */}
        <div className="bg-green-600 rounded-xl p-3 shadow-lg min-h-[580px] flex flex-col gap-2 relative overflow-hidden border-2 border-green-700">
          
          {/* 하프라인 & 센터서클 장식 */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-16 border-2 border-white/20 rounded-b-full"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-16 border-2 border-white/20 rounded-t-full"></div>

          {getPositionLayout().map((pos) => (
            <div
              key={pos}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(pos)}
              className="z-10 flex-1 border border-white/10 rounded-lg p-1 flex flex-col justify-center items-center bg-white/5 backdrop-blur-[1px] relative transition-colors hover:bg-white/10"
            >
              <div className="text-white/60 text-[10px] font-bold uppercase mb-1 tracking-wider">{pos}</div>
              <div className="flex flex-wrap justify-center gap-1.5 w-full">
                {lineup[pos].map((name) => (
                  <div
                    key={name}
                    draggable
                    onDragStart={() => handleDragStart(name)}
                    className="bg-white text-green-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm cursor-grab active:cursor-grabbing border border-green-200 whitespace-nowrap"
                  >
                    {name}
                  </div>
                ))}
                {lineup[pos].length === 0 && <span className="text-white/20 text-[10px]">-</span>}
              </div>
            </div>
          ))}
        </div>

        {/* 대기 명단 (벤치) */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('bench')}
          className="bg-white p-4 rounded-xl shadow-md min-h-[100px] border border-gray-100"
        >
          <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Bench ({players.length})</h3>
          <div className="flex flex-wrap gap-2">
            {players.map((name) => (
              <div
                key={name}
                draggable
                onDragStart={() => handleDragStart(name)}
                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold cursor-grab active:cursor-grabbing hover:bg-gray-200 transition border border-gray-200"
              >
                {name}
              </div>
            ))}
            {players.length === 0 && <span className="text-gray-300 text-xs w-full text-center py-2">대기 선수 없음</span>}
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400">
          * 선수를 길게 눌러 포지션 박스로 이동시키세요.
        </div>

      </main>
    </div>
  );
}
