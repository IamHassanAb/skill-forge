import { useState, useRef, useEffect, useCallback } from 'react';

const WAVE_BAR_COUNT = 10;
const MAX_SECONDS = 90;

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const AudioRecorder = ({ prompt, onSubmit, isLoading }) => {
  const [recorderState, setRecorderState] = useState('idle');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());

        // Transcribe
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('file', blob, 'recording.webm');
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          setTranscript(data.transcript || '');
        } catch (err) {
          console.error('Transcription failed:', err);
          setTranscript('[Transcription unavailable]');
        }
        setIsTranscribing(false);
        setRecorderState('playback');
      };

      recorder.start();
      setTimer(0);
      setRecorderState('recording');

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            recorder.stop();
            clearInterval(timerRef.current);
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecorderState('idle');
    setAudioBlob(null);
    setTranscript('');
    setTimer(0);
    setIsPlaying(false);
    setPlaybackTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  // Audio playback handlers
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setPlaybackTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setPlaybackDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const handleScrub = (e) => {
    if (!audioRef.current) return;
    const pct = parseFloat(e.target.value);
    audioRef.current.currentTime = pct * playbackDuration;
    setPlaybackTime(audioRef.current.currentTime);
  };

  const remaining = MAX_SECONDS - timer;

  return (
    <div className="bg-[var(--s1)] border border-[var(--border)] rounded-3xl p-12 md:p-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-terracotta/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 mb-8">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-terracotta">
            PRACTICE · SPOKEN
          </span>
        </div>

        {/* Prompt */}
        <p className="font-serif italic text-3xl md:text-4xl text-white leading-snug text-center mb-16 max-w-xl">
          {prompt}
        </p>

        {/* ── IDLE STATE ── */}
        {recorderState === 'idle' && (
          <div className="flex flex-col items-center">
            <button
              onClick={startRecording}
              aria-label="Start recording"
              className="w-[72px] h-[72px] rounded-full bg-[var(--s2)] border border-[var(--border2)] flex items-center justify-center hover:border-terracotta transition-all group cursor-pointer mb-6"
            >
              <svg className="w-7 h-7 text-[var(--t3)] group-hover:text-terracotta transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
            <span className="text-[var(--t3)] text-sm font-medium tracking-wide mb-2">
              Tap to begin recording
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--t4)]">
              60–90 seconds · Max 1:30
            </span>
          </div>
        )}

        {/* ── RECORDING STATE ── */}
        {recorderState === 'recording' && (
          <div className="flex flex-col items-center">
            {/* Active ring + stop button */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-32 h-32 rounded-full border border-terracotta/40 bg-terracotta/5 animate-pulse" />
              <button
                onClick={stopRecording}
                aria-label="Stop recording"
                className="relative w-20 h-20 rounded-full border-2 border-terracotta bg-terracotta/10 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="w-4 h-4 bg-terracotta rounded-sm" />
              </button>
            </div>

            {/* Timer */}
            <div className="text-6xl font-light text-[var(--t1)] tabular-nums tracking-tight mb-8">
              {formatTime(timer)}
            </div>

            {/* Waveform */}
            <div className="flex items-center gap-1.5 mb-6 h-10">
              {Array.from({ length: WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-terracotta animate-wave-bar"
                  style={{
                    opacity: 0.6 + Math.random() * 0.4,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <span className="text-[var(--t3)] text-sm">
              Tap to stop · {formatTime(remaining)} remaining
            </span>

          </div>
        )}

        {/* ── PLAYBACK STATE ── */}
        {recorderState === 'playback' && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* Hidden audio element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />
            )}

            {/* Audio player card */}
            <div className="w-full bg-[var(--s2)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-4">
                {/* Play button */}
                <button
                  onClick={togglePlayback}
                  aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
                  className="w-[34px] h-[34px] rounded-full bg-terracotta flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Scrubber */}
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={playbackDuration ? playbackTime / playbackDuration : 0}
                    onChange={handleScrub}
                    aria-label="Playback position"
                    className="w-full h-1 appearance-none bg-[var(--border2)] rounded cursor-pointer accent-terracotta"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[var(--t3)] text-xs tabular-nums">
                  {formatTime(Math.floor(playbackTime))}
                </span>
                <span className="text-[var(--t3)] text-xs tabular-nums">
                  {formatTime(Math.floor(playbackDuration))}
                </span>
              </div>
            </div>

            {/* Transcript preview */}
            <div className="w-full bg-[var(--border)] rounded-lg p-4">
              <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-[var(--t3)] mb-2">
                TRANSCRIPT PREVIEW
              </div>
              {isTranscribing ? (
                <div role="status" aria-live="polite" className="flex items-center gap-2 text-[var(--t3)] text-sm">
                  <div className="w-3 h-3 border-2 border-stone-600 border-t-terracotta rounded-full animate-spin" />
                  Transcribing…
                </div>
              ) : (
                <p className="font-serif italic text-[var(--t3)] text-sm leading-relaxed">
                  {transcript}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={resetRecording}
                className="text-[var(--t3)] hover:text-[var(--t2)] transition-colors text-sm font-medium cursor-pointer"
              >
                Re-record
              </button>
              <button
                onClick={() => onSubmit(audioBlob, transcript)}
                disabled={isLoading || isTranscribing}
                className="flex-1 bg-terracotta text-white py-3 rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div role="status" aria-live="polite" className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit recording →'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
