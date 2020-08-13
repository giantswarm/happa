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
  it('can search for different terms, with multiple registered types', () => {
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

    let result = us.search('some', stateToSearch);
    expect(result.length).toBe(2);

    result = us.search('amazing', stateToSearch);
    expect(result.length).toBe(1);

    result = us.search('random', stateToSearch);
    expect(result.length).toBe(1);

    result = us.search('crazy', stateToSearch);
    expect(result.length).toBe(0);
  });
});

function registerClusterSearcherFilter(searcher: IUniversalSearcher) {
  function* searcherFn(
    state: ITestState,
    term: string
  ): Iterator<ITestCluster> {
    if (term.length < 1) {
      return state.clusters.items;
    }

    yield* state.clusters.items.filter((currValue: ITestCluster): boolean => {
      const termLowerCased = term.toLowerCase();
      const containsTermInID = currValue.id
        .toLowerCase()
        .includes(termLowerCased);
      const containsTermInName = currValue.name
        .toLowerCase()
        .includes(termLowerCased);

      return containsTermInID || containsTermInName;
    });

    return undefined;
  }

  searcher.registerFilter({
    type: 'cluster',
    renderer: () => null,
    searcher: searcherFn,
  });
}

function registerAppSearcherFilter(searcher: IUniversalSearcher) {
  function* searcherFn(state: ITestState, term: string): Iterator<ITestApp> {
    if (term.length < 1) {
      return state.clusters.items;
    }

    yield* state.apps.items.filter((currValue: ITestApp): boolean => {
      const termLowerCased = term.toLowerCase();

      return currValue.name.toLowerCase().includes(termLowerCased);
    });

    return undefined;
  }

  searcher.registerFilter({
    type: 'app',
    renderer: () => null,
    searcher: searcherFn,
  });
}
