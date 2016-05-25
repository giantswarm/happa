'use strict';

// Line
// Used in CodeBlock and FileBlock
// <Line prompt={true} text="Some text" />;
//
// prompt: Display this line as a prompt or not (adds the dollar sign before the text)
// text: The text that this line should display

var React = require('react');

var stripIndent = function(str) {
  const match = str.match(/^[ \t]*(?=\S)/gm);

  if (!match) {
    return str;
  }

  // TODO: use spread operator when targeting Node.js 6
  const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
  const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');

  return indent > 0 ? str.replace(re, '') : str;
};

module.exports = React.createClass ({
  nonIndentedLines: function() {
    return this.props.text.split("\n").map(stripIndent).join("\n");
  },

  render: function() {
    return (
      <div className={this.props.prompt ? "codeblock--line codeblock--prompt" : "codeblock--line"}>
        <span className="codeblock--prompt-indicator">{this.props.prompt ? "$ " : null}</span>
        {this.nonIndentedLines()}
      </div>
    );
  }
});