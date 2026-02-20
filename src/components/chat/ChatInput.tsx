import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import type { VoiceLanguage } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendVoice?: (audioBlob: Blob, language: VoiceLanguage) => void;
  disabled?: boolean;
  isLoading?: boolean;
  isVoiceProcessing?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  onSendVoice,
  disabled = false,
  isLoading = false,
  isVoiceProcessing = false,
  placeholder = 'Type your message...',
  maxLength = 2000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines roughly
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isLoading) return;
    
    onSend(trimmedMessage);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = message.length > maxLength;
  const canSend = message.trim().length > 0 && !isOverLimit && !disabled && !isLoading;

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading || isVoiceProcessing}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-16',
              isOverLimit && 'border-destructive focus-visible:ring-destructive'
            )}
            rows={1}
          />
          {/* Character counter */}
          <div
            className={cn(
              'absolute bottom-2 right-3 text-xs',
              isOverLimit ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {message.length}/{maxLength}
          </div>
        </div>

        {/* Voice Recorder */}
        {onSendVoice && (
          <VoiceRecorder
            onRecordingComplete={onSendVoice}
            disabled={disabled || isLoading}
            isProcessing={isVoiceProcessing}
          />
        )}
        
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className="h-11 w-11 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        AI can make mistakes. Please verify important medical information with your doctor.
      </p>
    </div>
  );
}
