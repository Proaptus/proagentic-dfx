/**
 * UI Component Library Exports
 * REQ-272: Component library with consistent styling
 */

export { Button } from './Button';
export { Card, CardHeader, CardTitle } from './Card';
export { StatCard, type StatCardProps } from './StatCard';
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';
export { AccessibleLabel } from './AccessibleLabel';
export { SkipLink } from './SkipLink';
export { ThemeToggle } from './ThemeToggle';

// Enterprise UI Components
export { DataTable, type Column } from './DataTable';
export { Tabs, type Tab } from './Tabs';
export { Tooltip, TooltipTable, TooltipEquation } from './Tooltip';
export {
  Badge,
  StatusBadge,
  PriorityBadge,
  ComplianceBadge,
  type BadgeVariant,
  type BadgeSize,
} from './Badge';
export {
  LinearProgress,
  CircularProgress,
  StepProgress,
  type Step,
} from './Progress';
export {
  Alert,
  CalculationAlert,
  ComplianceAlert,
  ValidationAlert,
  type AlertVariant,
} from './Alert';

// Form Components
export { Input } from './input';
export { Label } from './label';
export { Checkbox } from './checkbox';

// Layout Components
export { ScrollArea } from './scroll-area';
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

// Re-export Tooltip components for help system
export { TooltipProvider, TooltipTrigger, TooltipContent } from './Tooltip';

// Global Search Components
export { GlobalSearch } from './GlobalSearch';
export { SearchTrigger } from './SearchTrigger';
