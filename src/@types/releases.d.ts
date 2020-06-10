interface IReleaseChangelog {
  component: string;
  description: string;
}

interface IReleaseComponent {
  name: string;
  version: string;
}

interface IRelease {
  version: string;
  timestamp: string;
  changelog: IReleaseChangelog[];
  components: IReleaseComponent[];
}
