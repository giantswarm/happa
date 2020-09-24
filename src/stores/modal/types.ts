import { MODAL_HIDE } from 'stores/modal/constants';

export interface IModalState {
  visible: boolean;
  templateValues: Record<string, unknown>;
  template: string;
}

export interface IModalHideAction {
  type: typeof MODAL_HIDE;
}

export type ModalActions = IModalHideAction;
