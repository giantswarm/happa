import { MatcherFunction, Nullish } from '@testing-library/react';

type Query = (matcher: MatcherFunction) => HTMLElement;

/**
 * Decorate an existing query to match text across multiple
 * elements.
 * @param query
 */
export function withMarkup(query: Query) {
  return (text: string) => {
    return query((_, node: Nullish<Element>) => {
      if (!node) return false;

      const hasText = (n: Element) => n.textContent === text;
      const hasTextInChildren = Array.from(node.children).some((child) =>
        hasText(child)
      );

      return hasText(node) && !hasTextInChildren;
    });
  };
}
