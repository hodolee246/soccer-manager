import { NextResponse } from 'next/server';
import { addVote } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, status } = body;

  if (!name || !status) {
    return NextResponse.json({ error: 'Name and status are required' }, { status: 400 });
  }

  const updatedDB = addVote(name, status);
  return NextResponse.json(updatedDB);
}
