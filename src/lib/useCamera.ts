import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'paused' | 'error';
export type CameraErrorKind = 'unsupported' | 'insecure' | 'denied' | 'notfound' | 'busy' | 'disconnected' | 'unknown';

export interface CameraError {
  kind: CameraErrorKind;
  title: string;
  message: string;
}

function describe(err: unknown): CameraError {
  const name = (err as { name?: string })?.name ?? '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
    case 'PermissionDeniedError':
      return {
        kind: 'denied',
        title: 'The booth can’t see you yet',
        message: 'Camera access was blocked. Click the camera icon in your browser’s address bar, choose “Allow”, then try again.',
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return {
        kind: 'notfound',
        title: 'No camera found',
        message: 'We couldn’t find a webcam. Plug one in (or turn it on) and try again.',
      };
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return {
        kind: 'busy',
        title: 'Your camera is busy',
        message: 'Another app or tab might be using it. Close video calls or other camera apps, then try again.',
      };
    default:
      return {
        kind: 'unknown',
        title: 'Something went wrong',
        message: 'The camera didn’t start. Try again, or reload the page.',
      };
  }
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const deviceRef = useRef<string>('');
  const aliveRef = useRef(true);
  const reqRef = useRef(0); // discards results of superseded requests
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<CameraError | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const statusRef = useRef<CameraStatus>('idle');
  statusRef.current = status;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      t.onended = null;
      t.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      if (aliveRef.current) setDevices(all.filter((d) => d.kind === 'videoinput'));
    } catch { /* ignore */ }
  }, []);

  const start = useCallback(async (id?: string) => {
    if (!window.isSecureContext) {
      setError({ kind: 'insecure', title: 'Camera needs a secure page', message: 'Browsers only allow camera access on https:// or localhost. Open the booth from a secure address.' });
      setStatus('error');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError({ kind: 'unsupported', title: 'This browser can’t use a camera', message: 'Try a recent version of Chrome, Safari, Firefox or Edge.' });
      setStatus('error');
      return;
    }
    stop();
    const my = ++reqRef.current;
    setStatus('requesting');
    setError(null);
    const wanted = id ?? deviceRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          ...(wanted ? { deviceId: { exact: wanted } } : { facingMode: 'user' }),
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      if (!aliveRef.current || my !== reqRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const actual = track?.getSettings().deviceId ?? wanted ?? '';
      deviceRef.current = actual;
      setDeviceId(actual);
      if (track) {
        track.onended = () => {
          if (!aliveRef.current) return;
          stop();
          setError({ kind: 'disconnected', title: 'The camera disconnected', message: 'It may have been unplugged or switched off. Reconnect it and try again.' });
          setStatus('error');
        };
      }
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => undefined);
      }
      setStatus('ready');
      void refreshDevices(); // labels are only available after permission
    } catch (e) {
      if (!aliveRef.current || my !== reqRef.current) return;
      // a remembered device may have vanished; fall back to any camera once
      if (wanted && (e as { name?: string })?.name === 'OverconstrainedError') {
        deviceRef.current = '';
        return start('');
      }
      setError(describe(e));
      setStatus('error');
    }
  }, [refreshDevices, stop]);

  const selectDevice = useCallback((id: string) => {
    deviceRef.current = id;
    setDeviceId(id);
    void start(id);
  }, [start]);

  useEffect(() => {
    aliveRef.current = true;
    void start();
    const onDeviceChange = () => void refreshDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', onDeviceChange);
    // never keep the camera on in a background tab
    const onVisibility = () => {
      if (document.hidden) {
        reqRef.current++;
        stop();
        if (statusRef.current === 'ready' || statusRef.current === 'requesting') setStatus('paused');
      } else {
        if (statusRef.current === 'paused') void start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      aliveRef.current = false;
      reqRef.current++;
      navigator.mediaDevices?.removeEventListener?.('devicechange', onDeviceChange);
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [start, stop, refreshDevices]);

  return { videoRef, status, error, devices, deviceId, start, stop, selectDevice };
}
