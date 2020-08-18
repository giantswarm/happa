import UniversalSearcherImpl, {
  IUniversalSearcher,
} from 'lib/UniversalSearcher/UniversalSearcher';

interface ITestCluster {
  id: string;
  name: string;
  creationDate: number;
}

interface ITestApp {
  name: string;
  creationDate: number;
  catalog: string;
}

interface ITestState {
  clusters: {
    items: ITestCluster[];
  };
  apps: {
    items: ITestApp[];
  };
}

describe('UniversalSearcher', () => {
  it('returns all registered filters', () => {
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);
    registerAppSearcherFilter(us);

    const filters = us.getFilters();
    expect(Object.entries(filters).length).toBe(2);
    expect(filters.cluster.type).toBe('cluster');
    expect(filters.app.type).toBe('app');
  });

  it('can search for different terms, with single registered type', () => {
    const limit = 10;
    const stateToSearch: Partial<ITestState> = {
      clusters: {
        items: [
          {
            id: '1sd1f',
            name: 'Random cluster',
            creationDate: 123313120,
          },
          {
            id: '19sd1',
            name: 'Some weird cluster',
            creationDate: 4301234123,
          },
          {
            id: '23sa1',
            name: 'Some awesome cluster',
            creationDate: 12312030123,
          },
          {
            id: '1230ad',
            name: `A cluster. That's it`,
            creationDate: 15440450400,
          },
        ],
      },
    };
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);

    let result = us.search('some', stateToSearch, limit);
    expect(result.length).toBe(2);

    result = us.search('amazing', stateToSearch, limit);
    expect(result.length).toBe(0);

    result = us.search('random', stateToSearch, limit);
    expect(result.length).toBe(1);

    result = us.search('crazy', stateToSearch, limit);
    expect(result.length).toBe(0);
  });

  it('can search for different terms, with multiple registered types', () => {
    const limit = 10;
    const stateToSearch: ITestState = {
      clusters: {
        items: [
          {
            id: '1sd1f',
            name: 'Random cluster',
            creationDate: 123313120,
          },
          {
            id: '19sd1',
            name: 'Some weird cluster',
            creationDate: 4301234123,
          },
          {
            id: '23sa1',
            name: 'Some awesome cluster',
            creationDate: 12312030123,
          },
          {
            id: '1230ad',
            name: `A cluster. That's it`,
            creationDate: 15440450400,
          },
        ],
      },
      apps: {
        items: [
          {
            name: 'A cool app',
            creationDate: 12321312,
            catalog: 'random-catalog',
          },
          {
            name: 'A not so cool app',
            creationDate: 1234312365,
            catalog: 'not-so-random-catalog',
          },
          {
            name: 'An amazing app',
            creationDate: 12549054,
            catalog: 'random-catalog',
          },
          {
            name: 'Aaaaa...aaapp',
            creationDate: 12435055,
            catalog: 'some-catalog',
          },
        ],
      },
    };
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);
    registerAppSearcherFilter(us);

    let result = us.search('some', stateToSearch, limit);
    expect(result.length).toBe(2);

    result = us.search('amazing', stateToSearch, limit);
    expect(result.length).toBe(1);

    result = us.search('random', stateToSearch, limit);
    expect(result.length).toBe(1);

    result = us.search('crazy', stateToSearch, limit);
    expect(result.length).toBe(0);
  });

  it('can search for different terms, with multiple registered types, and single filter selected', () => {
    const limit = 10;
    const stateToSearch: ITestState = {
      clusters: {
        items: [
          {
            id: '1sd1f',
            name: 'Random cluster',
            creationDate: 123313120,
          },
          {
            id: '19sd1',
            name: 'Some weird cluster',
            creationDate: 4301234123,
          },
          {
            id: '23sa1',
            name: 'Some awesome cluster',
            creationDate: 12312030123,
          },
          {
            id: '1230ad',
            name: `A cluster. That's it`,
            creationDate: 15440450400,
          },
        ],
      },
      apps: {
        items: [
          {
            name: 'A cool app',
            creationDate: 12321312,
            catalog: 'random-catalog',
          },
          {
            name: 'A not so cool app',
            creationDate: 1234312365,
            catalog: 'not-so-random-catalog',
          },
          {
            name: 'An amazing app',
            creationDate: 12549054,
            catalog: 'random-catalog',
          },
          {
            name: 'Aaaaa...aaapp',
            creationDate: 12435055,
            catalog: 'some-catalog',
          },
        ],
      },
    };
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);
    registerAppSearcherFilter(us);

    let result = us.search('some', stateToSearch, limit, 'app');
    expect(result.length).toBe(0);

    result = us.search('amazing', stateToSearch, limit, 'app');
    expect(result.length).toBe(1);

    result = us.search('random', stateToSearch, limit, 'app');
    expect(result.length).toBe(0);

    result = us.search('crazy', stateToSearch, limit, 'app');
    expect(result.length).toBe(0);
  });

  it('limits the number of search results to the given value', () => {
    const stateToSearch: Partial<ITestState> = {
      clusters: {
        items: [
          {
            id: '1sd1f',
            name: 'A random cluster',
            creationDate: 123313120,
          },
          {
            id: '19sd1',
            name: 'A very random cluster',
            creationDate: 4301234123,
          },
          {
            id: '23sa1',
            name: 'A super random cluster',
            creationDate: 12312030123,
          },
          {
            id: '1230ad',
            name: 'You guessed it. Another random cluster',
            creationDate: 15440450400,
          },
        ],
      },
    };
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);

    let result = us.search('random', stateToSearch, 2);
    expect(result.length).toBe(2);

    result = us.search('random', stateToSearch, 3);
    expect(result.length).toBe(3);

    result = us.search('random', stateToSearch, 9);
    expect(result.length).toBe(4);
  });

  it('cannot use a filter that is not registered', () => {
    const limit = 10;
    const stateToSearch: ITestState = {
      clusters: {
        items: [
          {
            id: '1sd1f',
            name: 'Random cluster',
            creationDate: 123313120,
          },
          {
            id: '19sd1',
            name: 'Some weird cluster',
            creationDate: 4301234123,
          },
          {
            id: '23sa1',
            name: 'Some awesome cluster',
            creationDate: 12312030123,
          },
          {
            id: '1230ad',
            name: `A cluster. That's it`,
            creationDate: 15440450400,
          },
        ],
      },
      apps: {
        items: [
          {
            name: 'A cool app',
            creationDate: 12321312,
            catalog: 'random-catalog',
          },
          {
            name: 'A not so cool app',
            creationDate: 1234312365,
            catalog: 'not-so-random-catalog',
          },
          {
            name: 'An amazing app',
            creationDate: 12549054,
            catalog: 'random-catalog',
          },
          {
            name: 'Aaaaa...aaapp',
            creationDate: 12435055,
            catalog: 'some-catalog',
          },
        ],
      },
    };
    const us = new UniversalSearcherImpl();

    registerClusterSearcherFilter(us);
    registerAppSearcherFilter(us);

    expect(() => {
      us.search('test', stateToSearch, limit, 'random');
    }).toThrow('Unknown filter type');
  });
});

function registerClusterSearcherFilter(searcher: IUniversalSearcher) {
  function* searcherFn(
    state: ITestState,
    term: string
  ): Iterator<ITestCluster> {
    const termLowerCased = term.toLowerCase();

    for (const item of state.clusters.items) {
      if (
        item.id.toLowerCase().includes(termLowerCased) ||
        item.name.toLowerCase().includes(termLowerCased)
      ) {
        yield item;
      }
    }
  }

  searcher.registerFilter({
    type: 'cluster',
    renderer: () => null,
    urlFactory: () => '',
    searcher: searcherFn,
  });
}

function registerAppSearcherFilter(searcher: IUniversalSearcher) {
  function* searcherFn(state: ITestState, term: string): Iterator<ITestApp> {
    const termLowerCased = term.toLowerCase();

    for (const item of state.apps.items) {
      if (item.name.toLowerCase().includes(termLowerCased)) {
        yield item;
      }
    }
  }

  searcher.registerFilter({
    type: 'app',
    renderer: () => null,
    urlFactory: () => '',
    searcher: searcherFn,
  });
}
