import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { VoiceLanguage } from '@/types/chat';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, language: VoiceLanguage) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState<VoiceLanguage>('english');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          onRecordingComplete(audioBlob, language);
        }
        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setPermissionDenied(true);
    }
  }, [language, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setDuration(0);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="h-11 w-11 flex-shrink-0 rounded-full"
            >
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Processing voice message...</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        {/* Recording duration */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <span className="text-sm font-medium text-destructive tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Language selector (while recording) */}
        <Select
          value={language}
          onValueChange={(val) => setLanguage(val as VoiceLanguage)}
        >
          <SelectTrigger className="w-[110px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="kannada">ಕನ್ನಡ</SelectItem>
            <SelectItem value="hindi">हिन्दी</SelectItem>
          </SelectContent>
        </Select>

        {/* Stop button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="h-11 w-11 flex-shrink-0 rounded-full animate-pulse"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop recording</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Language selector */}
      <Select
        value={language}
        onValueChange={(val) => setLanguage(val as VoiceLanguage)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px] h-9 text-xs border-none bg-transparent hover:bg-muted/50 focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="kannada">ಕನ್ನಡ</SelectItem>
          <SelectItem value="hindi">हिन्दी</SelectItem>
        </SelectContent>
      </Select>

      {/* Mic button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={startRecording}
              disabled={disabled}
              className={cn(
                'h-11 w-11 flex-shrink-0 rounded-full transition-all',
                'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white',
                'dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white',
                permissionDenied && 'opacity-50'
              )}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {permissionDenied
              ? 'Microphone access denied. Please enable it in browser settings.'
              : 'Record voice message'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
