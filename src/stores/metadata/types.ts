import {
  METADATA_UPDATE_CHECK,
  METADATA_UPDATE_EXECUTE,
  METADATA_UPDATE_SCHEDULE,
  METADATA_UPDATE_SET_TIMER,
  METADATA_UPDATE_SET_VERSION,
} from 'stores/metadata/constants';

export interface IMetadataVersion {
  current: string;
  new: string | null;
  isUpdating: boolean;
  lastCheck: number;
  timer: number;
}

export interface IMetadataState {
  version: IMetadataVersion;
}

export interface IMetadataSetTimerAction {
  type: typeof METADATA_UPDATE_SET_TIMER;
  timer: number;
}

export interface IMetadataSetVersionAction {
  type: typeof METADATA_UPDATE_SET_VERSION;
  version: string;
}

export interface IMetadataCheckForUpdatesAction {
  type: typeof METADATA_UPDATE_CHECK;
  timestamp: number;
}

export interface IMetadataScheduleUpdateAction {
  type: typeof METADATA_UPDATE_SCHEDULE;
  version: string;
}

export interface IMetadataExecuteUpdateAction {
  type: typeof METADATA_UPDATE_EXECUTE;
}

export type MetadataAction =
  | IMetadataSetTimerAction
  | IMetadataSetVersionAction
  | IMetadataCheckForUpdatesAction
  | IMetadataScheduleUpdateAction
  | IMetadataExecuteUpdateAction;
