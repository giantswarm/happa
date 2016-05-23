'use strict';
var React = require('react');
var copy = require('copy-to-clipboard');
var $ = require('jquery');

module.exports = React.createClass ({
  rawMarkup: function() {
    return React.Children.map(this.props.children, child => {
      if (typeof child === 'string') {
        return this.stripIndent(child)
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

  copyCodeToClipboard: function(e) {
    console.log(this.rawMarkup()[0])
    copy(this.rawMarkup()[0].trim());
    e.preventDefault();

    var copyConfirmation = $(this.refs.confirmCopy)
    copyConfirmation.addClass('visible');
    setTimeout(function() {
      copyConfirmation.removeClass('visible');
    }, 500);
  },

  render() {
    return(
      <div className="codeblock--container">
        <pre>{this.rawMarkup()}</pre>
        <a href="#" onClick={this.copyCodeToClipboard}>Copy command to clipboard</a>
        <span className="codeblock--copy-confirmation" ref="confirmCopy">Copied!</span>
      </div>
    );
  }
});