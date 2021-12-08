import * as metav1 from '../metav1';

export type ReleaseState = 'active' | 'deprecated' | 'wip' | 'preview';

export interface IReleaseStatus {
  ready?: boolean;
  inUse?: boolean;
}

export interface IReleaseSpecApp {
  name: string;
  version: string;
  catalog?: string;
  componentVersion?: string;
}

export interface IReleaseSpecComponent {
  name: string;
  version: string;
  catalog?: string;
  reference?: string;
  releaseOperatorDeploy?: boolean;
}

export interface IReleaseSpec {
  apps: IReleaseSpecApp[] | null;
  components: IReleaseSpecComponent[];
  state: ReleaseState;
  date: string;
  endOfLifeDate?: string;
  notice?: string;
}

export const Release = 'Release';

export interface IRelease {
  apiVersion: 'release.giantswarm.io/v1alpha1';
  kind: typeof Release;
  metadata: metav1.IObjectMeta;
  spec: IReleaseSpec;
  status?: IReleaseStatus;
}

export const ReleaseList = 'ReleaseList';

export interface IReleaseList extends metav1.IList<IRelease> {
  apiVersion: 'release.giantswarm.io/v1alpha1';
  kind: typeof ReleaseList;
}
