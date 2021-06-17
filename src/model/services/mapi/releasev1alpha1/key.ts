import { IRelease } from './';

export const annotationReleaseNotesURL = 'giantswarm.io/release-notes';

export function getK8sVersion(cr: IRelease): string | undefined {
  return cr.spec.components.find((c) => c.name === 'kubernetes')?.version;
}

export function getReleaseNotesURL(cr: IRelease): string | undefined {
  return cr.metadata.annotations?.[annotationReleaseNotesURL];
}
