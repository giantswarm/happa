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

  // additional information
  kubernetesVersion: string;
  releaseNotesURL: string;
}

interface IReleases {
  [key: string]: IRelease;
}
