import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps {
  type: 'single' | 'multiple';
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
}

export function Accordion({ type, children, className = '', defaultValue = [] }: AccordionProps) {
  const [value, setValue] = React.useState<string[]>(defaultValue);

  const onValueChange = React.useCallback(
    (newValue: string[]) => {
      if (type === 'single') {
        setValue(newValue.slice(-1)); // Keep only last item
      } else {
        setValue(newValue);
      }
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function AccordionItem({ value, children, className = '' }: AccordionItemProps) {
  return (
    <div className={`border-b border-border ${className}`} data-value={value}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className = '' }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const item = React.useContext(AccordionItemContext);
  if (!item) throw new Error('AccordionTrigger must be used within AccordionItem');

  const isOpen = context.value.includes(item.value);

  const toggle = () => {
    if (isOpen) {
      context.onValueChange(context.value.filter((v) => v !== item.value));
    } else {
      context.onValueChange([...context.value, item.value]);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex w-full items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}
    >
      {children}
      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined);

// Wrap AccordionItem to provide context
const OriginalAccordionItem = AccordionItem;
export function AccordionItemWrapper({ value, children, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <OriginalAccordionItem value={value} {...props}>
        {children}
      </OriginalAccordionItem>
    </AccordionItemContext.Provider>
  );
}

// Override AccordionItem export
export { AccordionItemWrapper as AccordionItem };

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className = '' }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const item = React.useContext(AccordionItemContext);
  if (!item) throw new Error('AccordionContent must be used within AccordionItem');

  const isOpen = context.value.includes(item.value);

  if (!isOpen) return null;

  return (
    <div className={`pb-4 pt-0 ${className}`}>
      {children}
    </div>
  );
}
