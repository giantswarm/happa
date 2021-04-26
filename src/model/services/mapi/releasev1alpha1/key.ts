import { IRelease } from './';

export function getK8sVersion(cr: IRelease): string | undefined {
  return cr.spec.components.find((c) => c.name === 'kubernetes')?.version;
}
