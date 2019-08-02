import 'jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';
import CatalogTypeLabel from 'UI/catalog_type_label';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<CatalogTypeLabel />, div);
});

it('shows a more serious warning for the community catalog type', () => {
  const div = document.createElement('div');
  const { container } = render(
    <CatalogTypeLabel catalogType='community' />,
    div
  );

  expect(container.querySelector('i')).toHaveAttribute(
    'class',
    'fa fa-warning'
  );
});

it('shows a less serious warning for the incubator catalog type', () => {
  const div = document.createElement('div');
  const { container } = render(
    <CatalogTypeLabel catalogType='incubator' />,
    div
  );

  expect(container.querySelector('i')).toHaveAttribute('class', 'fa fa-info');
});

it('shows a less serious warning for the test catalog type', () => {
  const div = document.createElement('div');
  const { container } = render(
    <CatalogTypeLabel catalogType='incubator' />,
    div
  );

  expect(container.querySelector('i')).toHaveAttribute('class', 'fa fa-info');
});

it('renders nothing for unknown catalog types', () => {
  const div = document.createElement('div');
  const { container } = render(<CatalogTypeLabel catalogType='yolo' />, div);

  expect(container).toBeEmpty();
});
