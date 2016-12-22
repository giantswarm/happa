'use strict';
import React from 'react';
import marked from 'marked';

class Markdown extends React.Component {
  rawMarkup() {
    return React.Children.map(this.props.children, child => {
      if (typeof child === 'string') {
        return <span dangerouslySetInnerHTML={ {__html: marked(this.stripIndent(child), {sanitize: false})}} />;
      } else {
        return child;
      }
    });
  }

  stripIndent(str) {
    const match = str.match(/^[ \t]*(?=\S)/gm);

    if (!match) {
      return str;
    }

    // TODO: use spread operator when targeting Node.js 6
    const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
    const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');

    return indent > 0 ? str.replace(re, '') : str;
  }

  render() {
    return (<div>{this.rawMarkup()}</div>);
  }
}

Markdown.propTypes = {
  children: React.PropTypes.node
};

export default Markdown;