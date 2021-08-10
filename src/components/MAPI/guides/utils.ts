import { IState } from 'stores/state';

export function getCurrentInstallationContextName(state: IState): string {
  const codeName = state.main.info.general.installation_name;

  return `gs-${codeName}`;
}
