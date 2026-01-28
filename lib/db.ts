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

export function addDeposit(name: string, amount: number) {
  const db = readDB();
  db.deposits.push({ name, amount, timestamp: Date.now() });
  writeDB(db);
  return db;
}
