import { h2TankDomain } from './h2-tank';
import { pressureVesselDomain } from './pressure-vessel';
import type { DomainConfiguration } from './types';

export * from './types';
export { h2TankDomain } from './h2-tank';
export { pressureVesselDomain } from './pressure-vessel';

export const domains: Record<string, DomainConfiguration> = {
  'h2-tank': h2TankDomain,
  'pressure-vessel': pressureVesselDomain,
};

export function getDomain(id: string): DomainConfiguration | undefined {
  return domains[id];
}

export function listDomains(): DomainConfiguration[] {
  return Object.values(domains);
}
