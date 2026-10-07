'use client';

import {
  CarouselLayout,
  ControlBar,
  Chat,
  FocusLayout,
  LayoutContextProvider,
  ParticipantTile,
  useCreateLayoutContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useState } from 'react';

type CameraRef = ReturnType<typeof useTracks>[number];

const roleLabel = (t: CameraRef) => (isMentor(t) ? 'Mentor' : 'Mentee');
const isMentor = (t: CameraRef) => t.participant.attributes?.role === 'mentor';

export function MentorLayout() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  // null = follow the default (the mentor); otherwise the identity the viewer picked.
  const layoutContext = useCreateLayoutContext();
  const [showChat, setShowChat] = useState(false);
  const [pinned, setPinned] = useState<string | null>(null);

  const spotlit =
    tracks.find((t) => t.participant.identity === pinned) ??
    tracks.find(isMentor) ??
    tracks.find((t) => t.participant.isLocal) ??
    tracks[0];
  const others = tracks.filter((t) => t !== spotlit);

  return (
    <LayoutContextProvider value={layoutContext} onWidgetChange={(w) => setShowChat(!!w.showChat)}>
    <div className="lk-video-conference mentor-layout">
      <div className="mentor-body">
        <div className="mentor-main">
          {spotlit && (
            <div style={{ position: 'relative', display: 'flex' }}>
              <span className={`role-badge role-${roleLabel(spotlit).toLowerCase()}`}>{roleLabel(spotlit)}</span>
              <FocusLayout trackRef={spotlit} style={{ flex: 1 }} />
            </div>
          )}
        </div>
        {others.length > 0 && (
          <div className="mentor-side">
            <CarouselLayout tracks={others} orientation="vertical">
              <Thumb onPick={setPinned} />
            </CarouselLayout>
          </div>
        )}
        <Chat style={{ display: showChat ? 'grid' : 'none', width: 300, flex: 'none' }} />
      </div>
      {pinned && (
        <button className="lk-button" style={{ alignSelf: 'center' }} onClick={() => setPinned(null)}>
          Back to mentor
        </button>
      )}
      <ControlBar controls={{ screenShare: false }} />
    </div>
    </LayoutContextProvider>
  );
}

// CarouselLayout clones its child per track, passing the track as `trackRef`.
function Thumb({ trackRef, onPick }: { trackRef?: CameraRef; onPick: (id: string) => void }) {
  if (!trackRef) return null;
  return (
    <div style={{ position: 'relative' }} onClick={() => onPick(trackRef.participant.identity)}>
      <span className={`role-badge role-${roleLabel(trackRef).toLowerCase()}`}>{roleLabel(trackRef)}</span>
      <ParticipantTile trackRef={trackRef} disableSpeakingIndicator />
    </div>
  );
}
