export enum ReleaseComponentsDiffChangeType {
  Add,
  Update,
  Delete,
}

export interface IReleaseComponentsDiffChangeAdd {
  component: string;
  changeType: ReleaseComponentsDiffChangeType.Add;
  newVersion: string;
}

export interface IReleaseComponentsDiffChangeUpdate {
  component: string;
  changeType: ReleaseComponentsDiffChangeType.Update;
  newVersion: string;
  oldVersion: string;
}

export interface IReleaseComponentsDiffChangeDelete {
  component: string;
  changeType: ReleaseComponentsDiffChangeType.Delete;
  oldVersion: string;
}

export interface IReleaseComponentsDiff {
  changes: (
    | IReleaseComponentsDiffChangeAdd
    | IReleaseComponentsDiffChangeUpdate
    | IReleaseComponentsDiffChangeDelete
  )[];
}

export enum ReleaseVersionStatus {
  Stable,
  PreRelease,
}

export interface IReleaseVersion {
  version: string;
  status: ReleaseVersionStatus;
}
