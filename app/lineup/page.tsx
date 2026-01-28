'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Vote = {
  name: string;
  status: 'attendance' | 'absence' | 'undecided';
};

export default function LineupPage() {
  const [players, setPlayers] = useState<string[]>([]);
  const [formations, setFormations] = useState<{ [key: string]: string[] }>({
    FW: [],
    MF: [],
    DF: [],
    GK: [],
  });
  
  // 드래그 중인 선수 이름
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

    // 원래 있던 곳에서 제거
    const newPlayers = players.filter(p => p !== draggedPlayer);
    const newFormations = { ...formations };
    
    // 기존 포메이션에서도 제거
    Object.keys(newFormations).forEach(key => {
      newFormations[key] = newFormations[key].filter(p => p !== draggedPlayer);
    });

    if (zone === 'bench') {
      newPlayers.push(draggedPlayer);
    } else {
      newFormations[zone].push(draggedPlayer);
    }

    setPlayers(newPlayers);
    setFormations(newFormations);
    setDraggedPlayer(null);
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-blue-600 font-bold">← 뒤로가기</Link>
        <h1 className="text-xl font-bold text-green-900">📋 라인업 짜기</h1>
        <div className="w-16"></div> 
      </header>

      <main className="mx-auto max-w-md space-y-4">
        
        {/* 그라운드 (드롭존) */}
        <div className="bg-green-600 rounded-xl p-4 shadow-lg min-h-[500px] flex flex-col justify-between relative overflow-hidden border-2 border-green-700">
          {/* 하프라인 장식 */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-green-400 opacity-50"></div>

          {['FW', 'MF', 'DF', 'GK'].map((pos) => (
            <div
              key={pos}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(pos)}
              className="z-10 min-h-[80px] border border-white/20 rounded-lg p-2 flex flex-wrap gap-2 justify-center items-center bg-white/10 backdrop-blur-sm"
            >
              <div className="absolute left-2 text-white/50 text-xs font-bold">{pos}</div>
              {formations[pos].map((name) => (
                <div
                  key={name}
                  draggable
                  onDragStart={() => handleDragStart(name)}
                  className="bg-white text-green-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-md cursor-grab active:cursor-grabbing border border-green-200"
                >
                  {name}
                </div>
              ))}
              {formations[pos].length === 0 && <span className="text-white/30 text-xs">비어있음</span>}
            </div>
          ))}
        </div>

        {/* 대기 명단 (벤치) */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('bench')}
          className="bg-white p-4 rounded-xl shadow-md min-h-[120px]"
        >
          <h3 className="text-sm font-bold text-gray-500 mb-3">🏃 대기 선수 (드래그해서 배치하세요)</h3>
          <div className="flex flex-wrap gap-2">
            {players.map((name) => (
              <div
                key={name}
                draggable
                onDragStart={() => handleDragStart(name)}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium cursor-grab active:cursor-grabbing hover:bg-gray-200 transition"
              >
                {name}
              </div>
            ))}
            {players.length === 0 && <span className="text-gray-400 text-sm">모두 배치 완료! 👍</span>}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          * 선수를 꾹 눌러서 위 포지션 박스로 옮겨보세요.
        </div>

      </main>
    </div>
  );
}
