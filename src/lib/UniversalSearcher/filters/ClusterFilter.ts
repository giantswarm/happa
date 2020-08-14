import { IUniversalSearcherFilter } from 'lib/UniversalSearcher/UniversalSearcher';
import { IState } from 'reducers/types';

// FIXME: Create proper cluster type.
interface ICluster {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function* searcherFn(state: IState, term: string): Iterator<ICluster> {
  const termLowerCased = term.toLowerCase();
  const clusterList = Object.values<ICluster>(state.entities.clusters.items);

  let containsTermInID = false;
  let containsTermInName = false;
  for (const cluster of clusterList) {
    containsTermInID =
      cluster.id?.toLowerCase().includes(termLowerCased) ?? false;
    containsTermInName =
      cluster.name?.toLowerCase().includes(termLowerCased) ?? false;

    if (containsTermInID || containsTermInName) {
      yield cluster;
    }
  }
}

const ClusterFilter: IUniversalSearcherFilter<ICluster, IState> = {
  type: 'cluster',
  searcher: searcherFn,
  renderer: () => null,
};

export default ClusterFilter;
