import { IState } from 'reducers/types';

export function getMetadataCurrentVersion(state: IState): string {
  return state.metadata.version.current;
}

export function getMetadataNewVersion(state: IState): string | null {
  return state.metadata.version.new;
}

export function getMetadataIsUpdating(state: IState): boolean {
  return state.metadata.version.isUpdating;
}

export function getMetadataUpdateTimer(state: IState): number {
  return state.metadata.version.timer;
}
