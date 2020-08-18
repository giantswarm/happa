import { ReactNode } from 'react';

export interface IUniversalSearcher {
  /**
   * Register a new search filter.
   * @param filter
   */
  registerFilter<T, S>(filter: IUniversalSearcherFilter<T, S>): void;

  /**
   * Get all registered filters.
   */
  getFilters(): UniversalSearchFilterMap;

  /**
   * Search for a specific term in the given state object.
   * @param searchTerm - The given search term.
   * @param state
   * @param limit - The maximum number of returned results.
   */
  search<S>(
    searchTerm: string,
    state: S,
    limit: number
  ): IUniversalSearcherResult<unknown>[];

  /**
   * Search for a specific term in the given state object, while only
   * using a specific filter.
   * @param searchTerm - The given search term.
   * @param state
   * @param limit - The maximum number of returned results.
   * @param type - The name of the registered filter.
   */
  search<T, S>(
    searchTerm: string,
    state: S,
    limit: number,
    type: string
  ): IUniversalSearcherResult<T>[];
}

export interface IUniversalSearcherResult<T> {
  /**
   * The name of the registered filter which returned the value.
   */
  type: string;
  /**
   * The search result data structure.
   */
  result: T;
}

export interface IUniversalSearcherFilter<T, S> {
  /**
   * A unique name to identify the filter.
   */
  type: string;

  /**
   * A React component factory that will render the result row,
   * in the search results dropdown.
   *
   * Note: To get consistent styling, wrap your component in
   * the `components/UniversalSearch/filtersRendererWrapper` component.
   */
  renderer: UniversalSearcherRenderer<T>;

  /**
   * The filter generator that will yield each search result.
   *
   * This is a generator because it allows filters to have
   * 100% control on stuff such as the order of the search
   * results, and it makes possible having a unique limit for
   * the number of search results from all filters, without
   * unnecessary computation of additional results.
   * @param state
   * @param term - The search term.
   */
  searcher: (state: S, term: string) => Iterator<T>;

  /**
   * The factory that will generate the URL that the user
   * will be redirected to when clicking on the search result.
   */
  urlFactory: UniversalSearchURLFactory<T>;
}

/**
 * A React component factory that will render the result row,
 * in the search results dropdown.
 * @param state
 * @param searchTerm
 * @param type - The name of the registered filter.
 */
export type UniversalSearcherRenderer<T> = (
  result: T,
  searchTerm: string,
  type: string
) => ReactNode;

/**
 * The factory that will generate the URL that the user
 * will be redirected to when clicking on the search result.
 * @param result - The search result.
 * @param searchTerm
 */
export type UniversalSearchURLFactory<T> = (
  result: T,
  searchTerm: string
) => string;

/**
 * A map of all the registered search filters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UniversalSearchFilterMap<T = unknown, S = any> = Record<
  string,
  IUniversalSearcherFilter<T, S>
>;

class UniversalSearcherImpl implements IUniversalSearcher {
  public registerFilter<T, S>(filter: IUniversalSearcherFilter<T, S>) {
    this.knownFilters[filter.type] = filter as IUniversalSearcherFilter<
      T | unknown,
      S
    >;
  }

  public getFilters() {
    return Object.assign({}, this.knownFilters);
  }

  public search<S>(
    term: string,
    state: S,
    limit: number
  ): IUniversalSearcherResult<unknown>[];
  public search<T, S>(
    term: string,
    state: S,
    limit: number,
    type: string
  ): IUniversalSearcherResult<T>[];
  public search<T, S>(
    term: string,
    state: S,
    limit: number,
    type?: string
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
      while (!current.done && currentIndex < limit) {
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
