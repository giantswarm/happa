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
    switch (true) {
      case typeof cluster.delete_date !== 'undefined':
        // Ignore, we don't need to show deleted clusters.
        break;
      case cluster.id?.toLowerCase().includes(termLowerCased):
      case cluster.name?.toLowerCase().includes(termLowerCased):
        yield cluster;
        break;
    }
  }
}

const ClusterFilter: IUniversalSearcherFilter<ICluster, IState> = {
  type: 'cluster',
  searcher: searcherFn,
  renderer: () => null,
};

export default ClusterFilter;
