import { NextResponse } from 'next/server';
import { addDeposit } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // 금액은 10000원 고정
  const updatedDB = addDeposit(name, 10000);
  return NextResponse.json(updatedDB);
}
