import { ReactNode } from 'react';

type UniversalSearcherFilterName = string;

export interface IUniversalSearcher {
  registerFilter<T, S>(filter: IUniversalSearcherFilter<T, S>): void;
  getFilters(): UniversalSearchFilterMap;
  search<S>(term: string, state: S): IUniversalSearcherResult<unknown>[];
  search<T, S>(
    term: string,
    state: S,
    type: UniversalSearcherFilterName
  ): IUniversalSearcherResult<T>[];
}

export interface IUniversalSearcherResult<T> {
  type: UniversalSearcherFilterName;
  result: T;
}

export interface IUniversalSearcherFilter<T, S> {
  type: UniversalSearcherFilterName;
  renderer: UniversalSearcherRenderer<T>;
  searcher: (state: S, term: string) => Iterator<T>;
}

export type UniversalSearcherRenderer<T> = (
  element: T,
  searchTerm: string,
  type: string
) => ReactNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UniversalSearchFilterMap<T = unknown, S = any> = Record<
  UniversalSearcherFilterName,
  IUniversalSearcherFilter<T, S>
>;

class UniversalSearcherImpl implements IUniversalSearcher {
  // eslint-disable-next-line no-magic-numbers
  public static readonly searchItemsLimit = 10;

  public registerFilter<T, S>(filter: IUniversalSearcherFilter<T, S>) {
    this.knownFilters[filter.type] = filter as IUniversalSearcherFilter<
      T | unknown,
      S
    >;
  }

  public getFilters() {
    return Object.assign({}, this.knownFilters);
  }

  public search<S>(term: string, state: S): IUniversalSearcherResult<unknown>[];
  public search<T, S>(
    term: string,
    state: S,
    type: UniversalSearcherFilterName
  ): IUniversalSearcherResult<T>[];
  public search<T, S>(
    term: string,
    state: S,
    type?: UniversalSearcherFilterName
  ): IUniversalSearcherResult<T | unknown>[] {
    const result: IUniversalSearcherResult<T | unknown>[] = [];
    let filters: IUniversalSearcherFilter<T | unknown, S>[] = [];

    if (type) {
      if (!this.knownFilters[type]) {
        throw new TypeError('Unknown filter type.');
      }

      filters.push(this.knownFilters[type]);
    } else {
      filters = Object.values(this.knownFilters);
    }

    let currentIndex = 0;
    for (const filter of filters) {
      const iterator = UniversalSearcherImpl.searchWithFilter<T | unknown, S>(
        term,
        state,
        filter
      );

      let current = iterator.next();
      while (
        !current.done &&
        currentIndex < UniversalSearcherImpl.searchItemsLimit
      ) {
        result.push(current.value);

        current = iterator.next();
        currentIndex++;
      }
      iterator.return?.(null);
    }

    return result;
  }

  protected knownFilters: UniversalSearchFilterMap = {} as UniversalSearchFilterMap;

  private static *searchWithFilter<T, S>(
    term: string,
    state: S,
    filter: IUniversalSearcherFilter<T, S>
  ): Iterator<IUniversalSearcherResult<T>> {
    const iterator = filter.searcher(state, term);

    let current = iterator.next();
    while (!current.done) {
      yield {
        type: filter.type,
        result: current.value,
      };

      current = iterator.next();
    }
  }
}

export default UniversalSearcherImpl;
