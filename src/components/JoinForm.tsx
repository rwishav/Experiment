'use client';

import { useState } from 'react';

export function JoinForm({
  onJoin,
  notice,
}: {
  onJoin: (c: { token: string; url: string }) => void;
  notice?: string;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee'>('mentee');
  const [room, setRoom] = useState('classroom');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, room, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to join');
      onJoin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="join" onSubmit={submit}>
      <h1>Join classroom</h1>
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
      <select value={role} onChange={(e) => setRole(e.target.value as 'mentor' | 'mentee')} aria-label="Role">
        <option value="mentee">Mentee</option>
        <option value="mentor">Mentor</option>
      </select>
      <input placeholder="Classroom" value={room} onChange={(e) => setRoom(e.target.value)} required />
      <button disabled={busy}>{busy ? 'Joining…' : 'Join'}</button>
      {(error || notice) && <div className="error">{error || notice}</div>}
    </form>
  );
}
