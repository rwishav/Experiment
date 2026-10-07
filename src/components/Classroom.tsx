'use client';

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';
import { BackgroundControl } from './BackgroundControl';

export function Classroom({
  token,
  url,
  onLeave,
}: {
  token: string;
  url: string;
  onLeave: (message?: string) => void;
}) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect
      video
      audio
      data-lk-theme="default"
      style={{ height: '100vh' }}
      onDisconnected={() => onLeave()}
      onError={(err) => onLeave(`Could not join: ${err.message}`)}
    >
      <VideoConference />
      <BackgroundControl />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
