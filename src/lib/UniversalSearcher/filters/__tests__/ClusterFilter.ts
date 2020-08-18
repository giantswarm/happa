import ClusterFilter from 'lib/UniversalSearcher/filters/ClusterFilter';
import React from 'react';
import { IState } from 'reducers/types';

const testState: Partial<IState> = {
  entities: {
    clusters: {
      items: [
        {
          id: '1sd1f',
          name: 'Random cluster',
          create_date: 123313120,
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          create_date: 15440450400,
          delete_date: 12312312,
        },
      ],
    },
  },
};

describe('ClusterFilter', () => {
  describe('ClusterFilter::searcher', () => {
    it('searches in the cluster name', () => {
      const iterator = ClusterFilter.searcher(testState, 'some');

      const results: ICluster[] = [];
      let current = iterator.next();
      while (!current.done) {
        results.push(current.value);

        current = iterator.next();
      }

      expect(results).toHaveLength(2);
    });

    it('searches in the cluster id', () => {
      const iterator = ClusterFilter.searcher(testState, 'sd');

      const results: ICluster[] = [];
      let current = iterator.next();
      while (!current.done) {
        results.push(current.value);

        current = iterator.next();
      }

      expect(results).toHaveLength(1);
    });

    it('does not pick up deleted clusters', () => {
      const iterator = ClusterFilter.searcher(testState, 'cluster');

      const results: ICluster[] = [];
      let current = iterator.next();
      while (!current.done) {
        results.push(current.value);

        current = iterator.next();
      }

      expect(results).toHaveLength(2);
    });
  });

  describe('ClusterFilter::renderer', () => {
    it('returns a valid React component', () => {
      const cluster: ICluster = {
        owner: 'test',
        id: '1sd04',
      };
      const component = ClusterFilter.renderer(cluster, '', 'cluster');
      expect(React.isValidElement(component)).toBeTruthy();
    });
  });

  describe('ClusterFilter::urlFactory', () => {
    it('returns a valid route URL', () => {
      const cluster: ICluster = {
        owner: 'test',
        id: '1sd04',
      };
      const url = ClusterFilter.urlFactory(cluster, '');
      expect(url).toBe('/organizations/test/clusters/1sd04');
    });
  });
});
