import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import {
  IUniversalSearcher,
  IUniversalSearcherFilter,
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import * as React from 'react';
import { IState } from 'reducers/types';
import { getComponentWithStore, initialStorage } from 'testUtils/renderUtils';
import ClusterFilterRenderer from 'UniversalSearch/filters/ClusterFilterRenderer';
import UniversalSearch from 'UniversalSearch/UniversalSearch';
import UniversalSearchProvider from 'UniversalSearch/UniversalSearchProvider';

describe('UniversalSearch', () => {
  const memoryHistory = createMemoryHistory();
  const searchController = createTestSearchController();

  function renderUniversalSearch(state: IState = {}) {
    const provider = getComponentWithStore(
      UniversalSearchProvider,
      {
        controller: searchController,
        children: <UniversalSearch />,
      },
      state,
      initialStorage,
      memoryHistory
    );

    return render(provider);
  }

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    renderUniversalSearch();
  });

  it('searches for a given input', async () => {
    renderUniversalSearch(
      createStateWithClusters([
        {
          id: '1sd1f',
          name: 'Random cluster',
          owner: 'test',
          create_date: 123313120,
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          owner: 'test',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          owner: 'test2',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          owner: 'test',
          create_date: 15440450400,
          delete_date: 12312312,
        },
      ])
    );

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cluster' } });
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
  });

  it('displays a placeholder if no results are found', async () => {
    renderUniversalSearch(createStateWithClusters([]));

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: {
        value: 'cluster',
      },
    });
    const options = await screen.findByText(
      /No results found for your query./i
    );
    expect(options).toBeInTheDocument();
  });

  it(`clicking on a search result navigates to the result's page`, async () => {
    renderUniversalSearch(
      createStateWithClusters([
        {
          id: '1sd1f',
          name: 'Random cluster',
          create_date: 123313120,
          owner: 'test',
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          owner: 'test',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          owner: 'test2',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          create_date: 15440450400,
          owner: 'test',
          delete_date: 12312312,
        },
      ])
    );

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cluster' } });
    const options = await screen.findAllByRole('option');
    fireEvent.click(options[0]);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(memoryHistory.location.pathname).toMatch(/19sd1/i);
  });

  it('has a clear button, that clears the search bar content', () => {
    renderUniversalSearch(createStateWithClusters([]));

    const input = screen.getByRole('textbox', {
      name: /I'm looking for…/i,
    });
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: {
        value: 'cluster',
      },
    });
    const clearButton = screen.getByRole('button', {
      name: /clear/i,
    });
    fireEvent.click(clearButton);

    act(() => {
      jest.runAllTimers();
    });

    expect(input).toHaveValue('');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('highlights results on hover', async () => {
    renderUniversalSearch(
      createStateWithClusters([
        {
          id: '1sd1f',
          name: 'Random cluster',
          create_date: 123313120,
          owner: 'test',
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          owner: 'test',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          owner: 'test2',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          create_date: 15440450400,
          owner: 'test',
          delete_date: 12312312,
        },
      ])
    );

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cluster' } });

    const options = await screen.findAllByRole('option');
    fireEvent.mouseEnter(options[0]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.mouseLeave(options[0]);
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('can be controlled using the keyboard', async () => {
    renderUniversalSearch(
      createStateWithClusters([
        {
          id: '1sd1f',
          name: 'Random cluster',
          create_date: 123313120,
          owner: 'test',
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          owner: 'test',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          owner: 'test2',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          create_date: 15440450400,
          owner: 'test',
          delete_date: 12312312,
        },
      ])
    );

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cluster' } });

    // The results dropdown is closed after pressing the 'Escape' key.
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    // The results dropdown is opened again after pressing the down arrow key.
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const options = await screen.findAllByRole('option');
    expect(options.length).toBeGreaterThan(0);

    // Can navigate between search results with the arrow keys.
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    // Navigates to the search result's page after pressing on the 'Enter' key.
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(memoryHistory.location.pathname).toMatch(/19sd1/i);
  });

  it('has a hidden accessibility hint about the number of results found', async () => {
    renderUniversalSearch(
      createStateWithClusters([
        {
          id: '1sd1f',
          name: 'Random cluster',
          create_date: 123313120,
          owner: 'test',
          delete_date: 12312312,
        },
        {
          id: '19sd1',
          name: 'Some weird cluster',
          owner: 'test',
          create_date: 4301234123,
        },
        {
          id: '23sa1',
          name: 'Some awesome cluster',
          owner: 'test2',
          create_date: 12312030123,
        },
        {
          id: '1230ad',
          name: `A cluster. That's it`,
          create_date: 15440450400,
          owner: 'test',
          delete_date: 12312312,
        },
      ])
    );

    const input = screen.getByRole('textbox', {
      name: `I'm looking for…`,
    });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cluster' } });

    // getByRole('status') doesn't work here for some reason.
    const hint = await screen.findByText(/2 results available./i);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute('role', 'status');
  });
});

function createStateWithClusters(clusters: ICluster[]) {
  return {
    entities: {
      clusters: {
        items: clusters,
      },
    },
  };
}

function createTestSearchController() {
  function urlFactory(result: ICluster): string {
    return `/organizations/${result.owner}/clusters/${result.id}`;
  }

  function* searcherFn(state: IState, term: string): Iterator<ICluster> {
    const termLowerCased = term.toLowerCase();

    for (const cluster of state.entities.clusters.items) {
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

  const filter: IUniversalSearcherFilter<ICluster, IState> = {
    type: 'cluster',
    renderer: (result, searchTerm, type) =>
      ClusterFilterRenderer({ result, searchTerm, type }),
    urlFactory: urlFactory,
    searcher: searcherFn,
  };

  const searchController: IUniversalSearcher = {
    getFilters(): UniversalSearchFilterMap {
      return { cluster: filter } as UniversalSearchFilterMap;
    },
    registerFilter<T, S>() {},
    search<S>(
      searchTerm: string,
      state: S,
      limit: number
    ): IUniversalSearcherResult<ICluster>[] {
      const result: IUniversalSearcherResult<ICluster>[] = [];

      let currentIndex = 0;
      const iterator = filter.searcher(state, searchTerm);
      let current = iterator.next();
      while (!current.done && currentIndex < limit) {
        result.push({
          type: filter.type,
          result: current.value,
        });

        current = iterator.next();
        currentIndex++;
      }

      return result;
    },
  };

  return searchController;
}
