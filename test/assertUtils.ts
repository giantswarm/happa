import { BoundFunction, Queries, queries } from '@testing-library/react';

type BoundQuery<Q extends Queries = typeof queries> = BoundFunction<Q[keyof Q]>;

/**
 * Decorate an existing query to match text across multiple
 * elements.
 * @param query
 */
export function withMarkup<T extends BoundQuery>(query: T) {
  return (text: string) => {
    return query((_, node: Element | null) => {
      if (!node) return false;

      const hasText = (n: Element) => n.textContent === text;
      if (!hasText(node)) return false;

      const hasTextInChildren = Array.from(node.children).some(hasText);
      if (hasTextInChildren) return false;

      return true;
    });
  };
}
