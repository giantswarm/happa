interface IReleaseChangelog {
  component: string;
  description: string;
}

interface IReleaseComponent {
  name: string;
  version: string;
}

interface IRelease {
  // declared by api response
  changelog: IReleaseChangelog[];
  components: IReleaseComponent[];
  timestamp: string;
  version: string;
  active: boolean;

  // Injected by client-side.
  kubernetesVersion?: string;
  releaseNotesURL?: string;
  k8sVersionEOLDate?: string;
}

interface IReleases {
  [key: string]: IRelease;
}
