/**
 * Help System Components
 * Comprehensive help and documentation system for H2 Tank Designer
 */

export { HelpProvider, useHelp } from './HelpProvider';
export { HelpPanel } from './HelpPanel';
export { HelpIcon, InlineHelpIcon } from './HelpIcon';
export { GlossaryPanel } from './GlossaryPanel';
export { OnboardingTour, resetOnboardingTour } from './OnboardingTour';

// Re-export help data utilities
export {
  searchHelpTopics,
  getTopicById,
  getTopicsByCategory,
  HELP_TOPICS,
  type HelpTopic,
  type HelpCategory,
} from '@/lib/help/topics';

export {
  searchGlossary,
  getGlossaryTerm,
  getTermsByLetter,
  getAvailableLetters,
  GLOSSARY_TERMS,
  type GlossaryTerm,
} from '@/lib/help/glossary';
