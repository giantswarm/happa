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

  for (const cluster of clusterList) {
    if (cluster.delete_date) {
      continue;
    }

    if (cluster.id?.toLowerCase().includes(termLowerCased)) {
      yield cluster;
    }

    if (cluster.name?.toLowerCase().includes(termLowerCased)) {
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
