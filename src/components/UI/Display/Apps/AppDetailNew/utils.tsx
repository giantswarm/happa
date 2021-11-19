import { Constants } from 'model/constants';
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
// if it starts with a # though, that means the link references a anchor in the
// readme itself, and can be returned as is.
export function urlFor(href: string, baseURL: string) {
  if (href.charAt(0) === '#') {
    return href;
  }

  const absoluteURLMatch = /^https?:\/\/|^\/\//i;
  if (absoluteURLMatch.test(href)) {
    return href;
  }

  return baseURL + href;
}

// Generates a working base url for relative links in the readmes.
export function readmeBaseURL(readmeURL: string): string {
  if (!readmeURL) return '';

  // https://github.com/giantswarm/efk-stack-app/v0.3.2/README.md
  let r = readmeURL.replace(
    'https://raw.githubusercontent.com/',
    'https://github.com/'
  );

  const l = Constants.README_FILE.length;

  // https://github.com/giantswarm/efk-stack-app/v0.3.2/
  r = r.substring(0, readmeURL.length - l);

  // https://github.com/giantswarm/efk-stack-app/blob/v0.3.2/
  const readmeURLParts = r.split('/');
  const insertPoint = -2;
  readmeURLParts.splice(insertPoint, 0, 'blob');

  return readmeURLParts.join('/');
}
