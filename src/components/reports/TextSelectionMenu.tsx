// src/components/reports/TextSelectionMenu.tsx

import { useEffect, useRef } from 'react';
import { Sparkles, FileText, X } from 'lucide-react';

interface TextSelectionMenuProps {
  position: { x: number; y: number };
  selectedText: string;
  onExplain: () => void;
  onClose: () => void;
}

export function TextSelectionMenu({
  position,
  selectedText,
  onExplain,
  onClose
}: TextSelectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y + 5, window.innerHeight - 150),
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[180px] animate-in fade-in-0 zoom-in-95"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border mb-1 truncate max-w-[250px]">
        "{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}"
      </div>

      <button
        onClick={onExplain}
        className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded w-full text-left text-sm text-foreground transition-colors"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Explain this
      </button>
      
      {/* Disabled but visible "Add to notes" option */}
      <button
        disabled
        className="flex items-center gap-2 px-3 py-2 rounded w-full text-left text-sm opacity-50 cursor-not-allowed text-muted-foreground"
        title="Coming soon"
      >
        <FileText className="w-4 h-4" />
        Add to notes
      </button>

      <button
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded w-full text-left text-sm text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  );
}

export default TextSelectionMenu;
