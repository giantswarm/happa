import React from 'react';

// https://github.com/remarkjs/react-markdown/issues/69
export function HeadingRenderer(headingProps) {
  const children = React.Children.toArray(headingProps.children);
  const text = children.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');

  return React.createElement(
    `h${headingProps.level}`,
    { id: slug },
    headingProps.children
  );
}

export function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

// urlFor(url) turns relative links from the readme into absolute links that will
// work, and leaves absolute links alone.
export function urlFor(href, readmeBaseURL) {
  const absoluteURLMatch = /^https?:\/\/|^\/\//i;
  if (absoluteURLMatch.test(href)) {
    return href;
  }

  return readmeBaseURL + href;
}
