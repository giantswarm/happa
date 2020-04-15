import { IState } from 'reducers/types';

export const getMetadataCurrentVersion = (state: IState): string =>
  state.main.metadata.version.current;

export const getMetadataNewVersion = (state: IState): string | null =>
  state.main.metadata.version.new;

export const getMetadataIsUpdating = (state: IState): boolean =>
  state.main.metadata.version.isUpdating;
