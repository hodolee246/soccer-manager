import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type Vote = {
  name: string;
  status: 'attendance' | 'absence' | 'undecided';
  timestamp: number;
};

export type Deposit = {
  name: string;
  amount: number;
  month: string; // 'YYYY-MM' 형식
  status: 'paid' | 'rest'; // 입금 완료 or 휴식
  timestamp: number;
};

export type DBData = {
  votes: Vote[];
  deposits: Deposit[];
};

function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DBData = { votes: [], deposits: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

export function readDB(): DBData {
  initDB();
  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(fileContent);
  } catch (e) {
    return { votes: [], deposits: [] };
  }
}

export function writeDB(data: DBData) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function addVote(name: string, status: Vote['status']) {
  const db = readDB();
  // 기존 투표가 있으면 업데이트, 없으면 추가
  const existingIndex = db.votes.findIndex((v) => v.name === name);
  const newVote: Vote = { name, status, timestamp: Date.now() };

  if (existingIndex >= 0) {
    db.votes[existingIndex] = newVote;
  } else {
    db.votes.push(newVote);
  }
  writeDB(db);
  return db;
}

export function addDeposit(name: string, status: 'paid' | 'rest', month: string) {
  const db = readDB();
  // 해당 월에 이미 기록이 있으면 덮어쓰기
  const existingIndex = db.deposits.findIndex(d => d.name === name && d.month === month);
  
  const record: Deposit = { 
    name, 
    amount: status === 'paid' ? 10000 : 0, 
    month, 
    status, 
    timestamp: Date.now() 
  };

  if (existingIndex >= 0) {
    db.deposits[existingIndex] = record;
  } else {
    db.deposits.push(record);
  }
  
  writeDB(db);
  return db;
}
