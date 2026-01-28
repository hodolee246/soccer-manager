import { NextResponse } from 'next/server';
import { addDeposit, deleteDeposit } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, status, month } = body; 

  if (!name || !status || !month) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const updatedDB = addDeposit(name, status, month);
  return NextResponse.json(updatedDB);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const month = searchParams.get('month');

  if (!name || !month) {
    return NextResponse.json({ error: 'Name and month are required' }, { status: 400 });
  }

  const updatedDB = deleteDeposit(name, month);
  return NextResponse.json(updatedDB);
}
