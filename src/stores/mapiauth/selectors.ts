import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { IState } from 'stores/state';

export function getMapiAuthUser(state: IState): IOAuth2User | null {
  return state.entities.mapiAuth?.user ?? null;
}
