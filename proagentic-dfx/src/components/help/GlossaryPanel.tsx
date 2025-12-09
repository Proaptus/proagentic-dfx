'use client';

/**
 * GlossaryPanel - Engineering glossary with A-Z navigation
 */

import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/Badge';
import {
  getTermsByLetter,
  getAvailableLetters,
  searchGlossary,
  GlossaryTerm,
} from '@/lib/help/glossary';

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS = {
  material: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  physics: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  standard: 'bg-green-500/10 text-green-700 dark:text-green-300',
  manufacturing: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  testing: 'bg-red-500/10 text-red-700 dark:text-red-300',
};

export function GlossaryPanel({ isOpen, onClose }: GlossaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const availableLetters = useMemo(() => getAvailableLetters(), []);
  const termsByLetter = useMemo(() => getTermsByLetter(), []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchGlossary(searchQuery);
  }, [searchQuery]);

  const displayedTerms = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    if (selectedLetter) {
      return termsByLetter.get(selectedLetter) || [];
    }
    return [];
  }, [searchQuery, searchResults, selectedLetter, termsByLetter]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-label="Close glossary"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[700px] bg-background border-l border-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Engineering Glossary</h2>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} title="Close (Esc)">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search terms..."
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
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* A-Z Navigation */}
        {!searchQuery && (
          <div className="px-6 py-3 border-b border-border bg-muted/20">
            <div className="flex flex-wrap gap-1">
              {availableLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSelectedTerm(null);
                  }}
                  className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                    selectedLetter === letter
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Term List */}
          <ScrollArea className="w-1/3 border-r border-border">
            <div className="p-4 space-y-1">
              {displayedTerms.length === 0 && !searchQuery && !selectedLetter && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Select a letter to browse terms
                </div>
              )}

              {displayedTerms.length === 0 && (searchQuery || selectedLetter) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No terms found
                </div>
              )}

              {displayedTerms.map((term) => (
                <button
                  key={term.term}
                  onClick={() => setSelectedTerm(term)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedTerm?.term === term.term ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <span className="font-medium text-sm">{term.term}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Term Details */}
          <ScrollArea className="flex-1">
            {selectedTerm ? (
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedTerm.term}</h3>
                  <Badge className={CATEGORY_COLORS[selectedTerm.category]}>
                    {selectedTerm.category}
                  </Badge>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{selectedTerm.definition}</p>
                </div>

                {selectedTerm.formula && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Formula
                    </div>
                    <code className="text-sm font-mono">{selectedTerm.formula}</code>
                  </div>
                )}

                {selectedTerm.units && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Units
                    </div>
                    <div className="text-sm">{selectedTerm.units}</div>
                  </div>
                )}

                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Related Terms
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTermName) => {
                        // Find the related term
                        const relatedTerm = searchGlossary(relatedTermName)[0];
                        return (
                          <Button
                            key={relatedTermName}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (relatedTerm) {
                                setSelectedTerm(relatedTerm);
                                // Navigate to the letter if needed
                                const letter = relatedTerm.term[0].toUpperCase();
                                if (letter !== selectedLetter) {
                                  setSelectedLetter(letter);
                                }
                              }
                            }}
                          >
                            {relatedTermName}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {displayedTerms.length > 0
                  ? 'Select a term to view details'
                  : 'Browse or search for terms'}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
