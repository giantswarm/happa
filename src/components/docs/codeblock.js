'use strict';
var React = require('react');
var copy = require('copy-to-clipboard');
var $ = require('jquery');
var _ = require('underscore');
var Line = require("./line");

var Prompt = React.createClass ({
  render: function() {
    return <Line prompt={true} text={this.props.children}/>;
  }
});

var Output = React.createClass ({
  render: function() {
    return <Line prompt={false} text={this.props.children}/>;
  }
});

var CodeBlock = React.createClass ({
  getInitialState: function() {
    return {
      hovering: false
    };
  },

  promptLinesAsString: function() {
    var string = React.Children.toArray(this.props.children)
                  .filter(function(x){ return (x.type === Prompt); })
                  .map(function(x){ return x.props.children; })
                  .join("\n");

    return string;
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

  classNames: function() {
    var classNames = [];

    // this.props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    var childrenArray = [this.props.children].reduce(function(a, b) {
      return a.concat(b);
    }, []);

    classNames.push("codeblock--container");
    if (this.state.hovering) {classNames.push("hovering");}
    if (this.state.clicked) {classNames.push("clicked");}
    if (childrenArray.length === 1) {classNames.push("oneline");}

    return classNames.join(" ");
  },

  render() {
    return(
      <div className={this.classNames()}>
        <pre>
          { this.props.children }
          <div className="codeblock--buttons">
            <a href="#"
               onMouseOver={function() {this.setState({hovering: true});}.bind(this)}
               onMouseOut={function() {this.setState({hovering: false});}.bind(this)}
               onClick={this.copyCodeToClipboard}
               onMouseDown={function() {this.setState({clicked: true});}.bind(this)}
               onMouseUp={function() {this.setState({clicked: false});}.bind(this)}>
            ICON
            </a>
          </div>
        </pre>
      </div>
    );
  }
});

module.exports = {
  CodeBlock: CodeBlock,
  Prompt: Prompt,
  Output: Output
};