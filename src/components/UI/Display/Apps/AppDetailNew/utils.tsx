import React from 'react';

interface IHeadingProps extends React.ComponentPropsWithoutRef<'h1'> {
  level: number;
}

export interface IATagProps extends React.ComponentPropsWithoutRef<'a'> {
  href?: string;
}

// https://github.com/remarkjs/react-markdown/issues/69
export function HeadingRenderer(headingProps: IHeadingProps) {
  const children = React.Children.toArray(headingProps.children);
  const text = children.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');

  return React.createElement(
    `h${headingProps.level}`,
    { id: slug },
    headingProps.children
  );
}

// oponder: I don't understand how this works.. but it let's me narrow down
// the type of an uknown object by a property that it has.
// https://fettblog.eu/typescript-hasownproperty/
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

export function flatten(text: string, child: React.ReactNode): string {
  if (!child) {
    return text;
  }

  if (typeof child === 'string') {
    return text + child;
  }

  if (hasOwnProperty(child, 'props')) {
    return React.Children.toArray(child.props.children).reduce(flatten, text);
  }

  return '';
}

// urlFor(url) turns relative links from the readme into absolute links that will
// work, and leaves absolute links alone.
export function urlFor(href: string, readmeBaseURL: string) {
  const absoluteURLMatch = /^https?:\/\/|^\/\//i;
  if (absoluteURLMatch.test(href)) {
    return href;
  }

  return readmeBaseURL + href;
}
