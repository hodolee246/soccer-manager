import { NextResponse } from 'next/server';
import { addVote, deleteVote } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, status } = body;

  if (!name || !status) {
    return NextResponse.json({ error: 'Name and status are required' }, { status: 400 });
  }

  const updatedDB = addVote(name, status);
  return NextResponse.json(updatedDB);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const updatedDB = deleteVote(name);
  return NextResponse.json(updatedDB);
}
