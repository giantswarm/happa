import { IUniversalSearcherFilter } from 'lib/UniversalSearcher/UniversalSearcher';
import { IState } from 'reducers/types';
import ClusterFilterRenderer from 'UniversalSearch/filters/ClusterFilterRenderer';

function* searcherFn(state: IState, term: string): Iterator<ICluster> {
  const termLowerCased = term.toLowerCase();
  const clusterList = Object.values<ICluster>(state.entities.clusters.items);

  for (const cluster of clusterList) {
    switch (true) {
      case typeof cluster.delete_date !== 'undefined':
        // Ignore, we don't need to show deleted clusters.
        break;
      case cluster.id.toLowerCase().includes(termLowerCased):
      case cluster.name.toLowerCase().includes(termLowerCased):
        yield cluster;
        break;
    }
  }
}

const ClusterFilter: IUniversalSearcherFilter<ICluster, IState> = {
  type: 'cluster',
  searcher: searcherFn,
  renderer: (element, searchTerm, type) =>
    ClusterFilterRenderer({ element, searchTerm, type }),
};

export default ClusterFilter;
