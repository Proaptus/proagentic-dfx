'use client';

/**
 * HelpIcon - Contextual help trigger
 */

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useHelp } from './HelpProvider';
import { Button } from '@/components/ui/Button';
import {
  TooltipRoot as Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { getTopicById } from '@/lib/help/topics';

interface HelpIconProps {
  topicId: string;
  className?: string;
  showPreview?: boolean;
}

/**
 * Contextual help icon button
 * Opens help panel to specific topic
 */
export function HelpIcon({ topicId, className = '', showPreview = true }: HelpIconProps) {
  const { openTopic } = useHelp();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const topic = getTopicById(topicId);

  if (!topic) {
    console.warn(`HelpIcon: Topic not found: ${topicId}`);
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openTopic(topicId);
    setIsTooltipOpen(false);
  };

  // Extract first paragraph from content as preview
  const preview = showPreview
    ? topic.content
        .split('\n')
        .find((line) => line.trim() && !line.startsWith('#'))
        ?.trim()
        .substring(0, 150) + '...'
    : topic.title;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 p-0 hover:bg-transparent ${className}`}
            onClick={handleClick}
            aria-label={`Help: ${topic.title}`}
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{topic.title}</div>
            {showPreview && <div className="text-xs text-muted-foreground">{preview}</div>}
            <div className="text-xs text-primary pt-1">Click for details</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline help icon (smaller, minimal)
 */
export function InlineHelpIcon({ topicId, className = '' }: { topicId: string; className?: string }) {
  const { openTopic } = useHelp();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openTopic(topicId);
      }}
      className={`inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-accent transition-colors ${className}`}
      aria-label="Help"
    >
      <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary" />
    </button>
  );
}
