'use strict';
var React = require('react');
var copy = require('copy-to-clipboard');
var $ = require('jquery');
var _ = require('underscore');

var Line = React.createClass ({
  className: function() {
    var classes = [];

    classes.push("codeblock--line");
    if (this.props.hovering) {classes.push("hovering");}
    if (this.props.line.prompt) {classes.push("isprompt");}
    if (this.props.clicked) {classes.push("clicked");}

    return classes;
  },

  render: function() {
    return (
      <div className={this.className().join(" ")}>
        <span className="codeblock--prompt-indicator">{this.props.line.prompt ? "$ " : null}</span>
        {this.props.line.text}
      </div>
    );
  }
});

module.exports = React.createClass ({
  getInitialState: function() {
    return {
      hovering: false
    };
  },

  lines: function() {
    return React.Children.map(this.props.children, child => {
      if (typeof child === 'string') {
        var lines = child.split("\n");
        lines = lines.map(function(x) { return this.stripIndent(x); }.bind(this));
        lines = lines.map(function(x) { return {text: this.textWithoutPrompt(x), prompt: this.isPrompt(x)}; }.bind(this));
        lines = lines.map(function(x) { return <Line line={x} clicked={this.state.clicked} hovering={this.state.hovering}/>; }.bind(this));
        return lines;
      } else {
        // Someone nested a react component in here, so just return it?
        return child;
      }
    });
  },

  isPrompt: function(line) {
    var startsWithDollar = /^\$ (.*)$/;
    var match = line.match(startsWithDollar);

    if (match) {
      return true;
    } else {
      return false;
    }
  },

  textWithoutPrompt: function(line) {
    var startsWithDollar = /^\$ (.*)$/;
    var match = line.match(startsWithDollar);

    if (match) {
      return match[1];
    } else {
      return line;
    }
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

  promptLinesAsString: function() {
    var justThePromptLines = this.lines().filter(function(x) {
      return x.props.line.prompt;
    });

    justThePromptLines = justThePromptLines.map(function(x) {
      return x.props.line.text;
    });

    return justThePromptLines.join("\n");
  },

  copyCodeToClipboard: function(e) {
    e.preventDefault();

    copy(this.promptLinesAsString());

    var copyConfirmation = $(this.refs.confirmCopy);
    copyConfirmation.addClass('visible');
    setTimeout(function() {
      copyConfirmation.removeClass('visible');
    }, 500);
  },

  hovering: function() {
    this.setState({
      hovering: true
    });
  },

  notHovering: function() {
    this.setState({
      hovering: false
    });
  },

  clicked: function() {
    this.setState({
      clicked: true
    });
  },

  released: function() {
    this.setState({
      clicked: false
    });
  },

  render() {
    return(
      <div className={this.lines().length === 1 ? "codeblock--container oneline" : "codeblock--container"}>
        <pre>
          { this.lines() }

          <div className="codeblock--buttons">
            <a href="#"
               onMouseOver={this.hovering}
               onMouseOut={this.notHovering}
               onClick={this.copyCodeToClipboard}
               onMouseDown={this.clicked}
               onMouseUp={this.released}>
            ICON
            </a>
          </div>
        </pre>
      </div>
    );
  }
});