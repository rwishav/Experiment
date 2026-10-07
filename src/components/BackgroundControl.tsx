'use client';

import { useLocalParticipant } from '@livekit/components-react';
import { BackgroundProcessor, supportsBackgroundProcessors } from '@livekit/track-processors';
import type { LocalVideoTrack } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';

type Mode = 'off' | 'blur' | 'grey';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'off', label: 'Background: Off' },
  { value: 'blur', label: 'Background: Blur' },
  { value: 'grey', label: 'Background: Light grey' },
];

export function BackgroundControl() {
  const { cameraTrack } = useLocalParticipant();
  const [mode, setMode] = useState<Mode>('off');
  const [supported, setSupported] = useState(false);
  const processorRef = useRef<ReturnType<typeof BackgroundProcessor> | null>(null);
  const track = cameraTrack?.track as LocalVideoTrack | undefined;

  useEffect(() => setSupported(supportsBackgroundProcessors()), []);

  useEffect(() => {
    if (!track) return;
    let cancelled = false;
    (async () => {
      try {
        if (mode === 'off') {
          if (track.getProcessor()) await track.stopProcessor();
          processorRef.current = null;
          return;
        }
        const options =
          mode === 'blur'
            ? ({ mode: 'background-blur', blurRadius: 12 } as const)
            : ({ mode: 'virtual-background', imagePath: '/grey-bg.png' } as const);
        if (processorRef.current && track.getProcessor()) {
          await processorRef.current.switchTo(options);
        } else {
          const processor = BackgroundProcessor(options);
          processorRef.current = processor;
          if (!cancelled) await track.setProcessor(processor);
        }
      } catch (e) {
        console.error('Background effect failed', e);
        if (!cancelled) setMode('off');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, track]);

  if (!supported) return null;

  return (
    <select
      aria-label="Background effect"
      value={mode}
      onChange={(e) => setMode(e.target.value as Mode)}
      disabled={!track}
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 10,
        padding: '6px 10px',
        borderRadius: 6,
        background: '#1e1e1e',
        color: '#fff',
        border: '1px solid #444',
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
