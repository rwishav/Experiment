import { randomUUID } from 'node:crypto';
import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const MAX_PARTICIPANTS = 10;

export async function POST(req: Request) {
  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json({ error: 'Server is missing LiveKit credentials' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const room = typeof body.room === 'string' ? body.room.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(room)) {
    return NextResponse.json({ error: 'Classroom name must be 1-64 letters, numbers, - or _' }, { status: 400 });
  }
  if (name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: 'Name must be 1-50 characters' }, { status: 400 });
  }

  const httpUrl = LIVEKIT_URL.replace(/^ws/, 'http');
  const svc = new RoomServiceClient(httpUrl, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

  try {
    // Idempotent: returns the existing room if it is already open.
    await svc.createRoom({ name: room, maxParticipants: MAX_PARTICIPANTS, emptyTimeout: 300 });
    const participants = await svc.listParticipants(room);
    if (participants.length >= MAX_PARTICIPANTS) {
      return NextResponse.json({ error: 'Classroom is full (max 10 participants)' }, { status: 409 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not reach LiveKit server' }, { status: 502 });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: randomUUID(),
    name,
    ttl: '1h',
  });
  at.addGrant({
    room,
    roomJoin: true,
    canSubscribe: true,
    canPublish: true,
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
  });

  return NextResponse.json({ token: await at.toJwt(), url: LIVEKIT_URL });
}
