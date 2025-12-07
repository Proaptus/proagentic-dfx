import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DomainConfiguration } from '@/lib/domains/types';
import { h2TankDomain, getDomain } from '@/lib/domains';

interface DomainState {
  currentDomainId: string;
  currentDomain: DomainConfiguration;
  setDomain: (domainId: string) => void;
}

export const useDomainStore = create<DomainState>()(
  persist(
    (set) => ({
      currentDomainId: 'h2-tank',
      currentDomain: h2TankDomain,
      setDomain: (domainId: string) => {
        const domain = getDomain(domainId);
        if (domain) {
          set({ currentDomainId: domainId, currentDomain: domain });
        }
      },
    }),
    { name: 'domain-storage' }
  )
);
