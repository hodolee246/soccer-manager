import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-900">⚽️ 원패스 FC</h1>
        <p className="text-gray-600">이번 주 경기 참석하시나요?</p>
      </header>

      <main className="mx-auto max-w-md space-y-6">
        {/* 투표 섹션 */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">📅 1월 28일 (일) 경기</h2>
          <div className="grid grid-cols-3 gap-3">
            <button className="rounded-lg bg-blue-500 py-3 text-white font-semibold hover:bg-blue-600 active:bg-blue-700 transition">
              참석 🙆‍♂️
            </button>
            <button className="rounded-lg bg-red-500 py-3 text-white font-semibold hover:bg-red-600 active:bg-red-700 transition">
              불참 🙅‍♂️
            </button>
            <button className="rounded-lg bg-gray-400 py-3 text-white font-semibold hover:bg-gray-500 active:bg-gray-600 transition">
              미정 🤔
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            현재 12명 참석 예정
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
            
            <button className="w-full rounded-lg bg-blue-100 py-4 text-blue-700 font-bold hover:bg-blue-200 active:bg-blue-300 transition flex items-center justify-center gap-2">
              <span>💸 토스로 송금하기</span>
            </button>
            
            <button className="w-full rounded-lg border-2 border-green-500 py-3 text-green-600 font-bold hover:bg-green-50 active:bg-green-100 transition">
              ✅ 입금 완료했어요!
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
