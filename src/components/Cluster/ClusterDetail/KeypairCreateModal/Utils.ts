export const MODAL_CHANGE_TIMEOUT = 200;
export const VALIDATION_DEBOUNCE_RATE = 1000;

export enum KeypairCreateModalStatus {
  Adding,
  Success,
}

export function getDefaultDescription(email: string): string {
  return `Added by user ${email} using the Giant Swarm web interface`;
}

export function getModalTitle(status: KeypairCreateModalStatus): string {
  let title = '';
  if (status === KeypairCreateModalStatus.Success) {
    title = 'Your key pair and kubeconfig has been created.';
  } else {
    title = 'Create New Key Pair and Kubeconfig';
  }

  return title;
}

export function getModalCloseButtonText(
  status: KeypairCreateModalStatus
): string {
  let closeButtonText = '';
  if (status === KeypairCreateModalStatus.Success) {
    closeButtonText = 'Close';
  } else {
    closeButtonText = 'Cancel';
  }

  return closeButtonText;
}

export function cnPrefixValidation(value: string): string | null {
  let error: string | null = null;

  if (value !== '') {
    const endRegex = /[a-zA-Z0-9]$/g;
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9@.-]*$/g;
    if (!endRegex.test(value)) {
      error = 'The CN prefix must end with a-z, A-Z, 0-9';
    } else if (!regex.test(value)) {
      error = 'The CN prefix must contain only a-z, A-Z, 0-9 or -';
    }
  }

  return error;
}

export function getSubmitButtonText(
  loading: boolean,
  hasError: boolean
): string {
  let text = 'Create Key Pair';

  if (hasError) {
    text = 'Retry';
  }

  if (loading) {
    text = 'Creating Key Pair';
  }

  return text;
}
