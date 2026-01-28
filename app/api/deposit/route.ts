import { NextResponse } from 'next/server';
import { addDeposit } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, status, month } = body; // status: 'paid' | 'rest'

  if (!name || !status || !month) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const updatedDB = addDeposit(name, status, month);
  return NextResponse.json(updatedDB);
}
