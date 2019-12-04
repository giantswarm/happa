import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import CatalogTypeLabel from 'UI/catalog_type_label';
import React from 'react';

it('renders without crashing', () => {
  render(<CatalogTypeLabel />);
});

it('shows a more serious warning for the community catalog type', () => {
  const { container } = render(<CatalogTypeLabel catalogType='community' />);

  expect(container.querySelector('i')).toHaveAttribute(
    'class',
    'fa fa-warning'
  );
});

it('shows a less serious warning for the incubator catalog type', () => {
  const { container } = render(<CatalogTypeLabel catalogType='incubator' />);

  expect(container.querySelector('i')).toHaveAttribute('class', 'fa fa-info');
});

it('shows a less serious warning for the test catalog type', () => {
  const { container } = render(<CatalogTypeLabel catalogType='incubator' />);

  expect(container.querySelector('i')).toHaveAttribute('class', 'fa fa-info');
});

it('renders nothing for unknown catalog types', () => {
  const { container } = render(<CatalogTypeLabel catalogType='yolo' />);

  expect(container).toBeEmpty();
});
