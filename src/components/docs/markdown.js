'use strict';
var React = require('react');
var marked = require('marked');

module.exports = React.createClass ({
  rawMarkup: function() {
    return React.Children.map(this.props.children, child => {
      if (typeof child === 'string') {
        return <span dangerouslySetInnerHTML={ {__html: marked(this.stripIndent(child), {sanitize: true})}} />;
      } else {
        return child;
      }
    });
  },

  stripIndent: function(str) {
    const match = str.match(/^[ \t]*(?=\S)/gm);

    if (!match) {
      return str;
    }

    // TODO: use spread operator when targeting Node.js 6
    const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
    const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');

    return indent > 0 ? str.replace(re, '') : str;
  },

  render: function() {
    return (<div>{this.rawMarkup()}</div>);
  }
});