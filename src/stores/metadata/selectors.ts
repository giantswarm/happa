import { IState } from 'reducers/types';

export function getMetadataCurrentVersion(state: IState): string {
  return state.entities.metadata.version.current;
}

export function getMetadataNewVersion(state: IState): string | null {
  return state.entities.metadata.version.new;
}

export function getMetadataIsUpdating(state: IState): boolean {
  return state.entities.metadata.version.isUpdating;
}

export function getMetadataUpdateTimer(state: IState): number {
  return state.entities.metadata.version.timer;
}
