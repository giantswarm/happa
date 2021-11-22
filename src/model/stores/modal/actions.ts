import { MODAL_HIDE } from 'model/stores/modal/constants';
import { ModalActions } from 'model/stores/modal/types';

export function modalHide(): ModalActions {
  return { type: MODAL_HIDE };
}
