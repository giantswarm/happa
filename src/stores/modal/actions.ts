import { MODAL_HIDE } from 'stores/modal/constants';
import { ModalActions } from 'stores/modal/types';

export function modalHide(): ModalActions {
  return { type: MODAL_HIDE };
}
