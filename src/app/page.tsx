'use client';

import { useState } from 'react';
import { Classroom } from '@/components/Classroom';
import { JoinForm } from '@/components/JoinForm';

export default function Home() {
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const [notice, setNotice] = useState('');

  if (conn) {
    return (
      <Classroom
        token={conn.token}
        url={conn.url}
        onLeave={(msg) => {
          setConn(null);
          setNotice(msg ?? '');
        }}
      />
    );
  }
  return <JoinForm notice={notice} onJoin={(c) => { setNotice(''); setConn(c); }} />;
}
