'use client';

/**
 * HelpPanel - Slide-out help panel
 */

import React, { useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { useHelp } from './HelpProvider';
import { getTopicById, getTopicsByCategory, HelpCategory } from '@/lib/help/topics';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS: Record<HelpCategory, string> = {
  requirements: 'Requirements & Standards',
  'tank-types': 'Tank Types & Materials',
  analysis: 'Analysis & Simulation',
  standards: 'Standards & Compliance',
  physics: 'Physics & Engineering',
  workflow: 'Design Workflow',
  troubleshooting: 'Troubleshooting',
};

export function HelpPanel() {
  const {
    currentTopicId,
    isPanelOpen,
    searchQuery,
    searchResults,
    recentTopics,
    openTopic,
    closePanel,
    setSearchQuery,
    clearSearch,
    goBack,
    goForward,
  } = useHelp();

  const currentTopic = useMemo(() => {
    return currentTopicId ? getTopicById(currentTopicId) : null;
  }, [currentTopicId]);

  const recentTopicObjects = useMemo(() => {
    return recentTopics.map((id) => getTopicById(id)).filter(Boolean);
  }, [recentTopics]);

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closePanel}
        aria-label="Close help panel"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[600px] bg-background border-l border-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Help & Documentation</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation buttons */}
            <Button variant="ghost" size="icon" onClick={goBack} title="Go back">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goForward} title="Go forward">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                clearSearch();
                openTopic('design-workflow');
              }}
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={closePanel} title="Close (Esc)">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Search Results ({searchResults.length})
                </h3>
                <div className="space-y-1">
                  {searchResults.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        openTopic(topic.id);
                        clearSearch();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="font-medium text-sm">{topic.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {CATEGORY_LABELS[topic.category]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No results found for &quot;{searchQuery}&quot;</p>
                <Button variant="link" onClick={clearSearch} className="mt-2">
                  Clear search
                </Button>
              </div>
            )}

            {/* Topic Content */}
            {!searchQuery && currentTopic && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    {CATEGORY_LABELS[currentTopic.category]}
                  </div>
                  <h3 className="text-2xl font-bold">{currentTopic.title}</h3>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{currentTopic.content}</ReactMarkdown>
                </div>

                {/* Related Topics */}
                {currentTopic.relatedTopics && currentTopic.relatedTopics.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <h4 className="text-sm font-semibold mb-3">Related Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentTopic.relatedTopics.map((relatedId) => {
                        const relatedTopic = getTopicById(relatedId);
                        if (!relatedTopic) return null;
                        return (
                          <Button
                            key={relatedId}
                            variant="outline"
                            size="sm"
                            onClick={() => openTopic(relatedId)}
                          >
                            {relatedTopic.title}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Topic Browser (when no search, no topic) */}
            {!searchQuery && !currentTopic && (
              <div className="space-y-6">
                {/* Recent Topics */}
                {recentTopicObjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Recently Viewed
                    </h3>
                    <div className="space-y-1">
                      {recentTopicObjects.map((topic) => (
                        <button
                          key={topic!.id}
                          onClick={() => openTopic(topic!.id)}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm">{topic!.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {CATEGORY_LABELS[topic!.category]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Browse by Category
                  </h3>
                  <Accordion type="multiple" className="w-full">
                    {(Object.keys(CATEGORY_LABELS) as HelpCategory[]).map((category) => {
                      const topics = getTopicsByCategory(category);
                      if (topics.length === 0) return null;

                      return (
                        <AccordionItem key={category} value={category}>
                          <AccordionTrigger className="text-sm font-medium">
                            {CATEGORY_LABELS[category]} ({topics.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1 pl-2">
                              {topics.map((topic) => (
                                <button
                                  key={topic.id}
                                  onClick={() => openTopic(topic.id)}
                                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                                >
                                  {topic.title}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
