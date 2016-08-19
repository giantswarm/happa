'use strict';

// CodeBlock
// Use this to show some commands and output to the user.
// User's can copy the commands to their clipboard easily.
//
//      <CodeBlock>
//        <Prompt>
//          {`kubectl version \\
//            long \\
//            command`}
//        </Prompt>
//
//        <Output>
//          {`output`}
//        </Output>
//      </CodeBlock>
//
// Output and Prompt can be in any order. The copy to clipboard button will only
// take the content in the Prompt tags.


import React from 'react';
import copy from 'copy-to-clipboard';
import _ from 'underscore';
import Line from "./line";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Helpers from '../../lib/helpers';

var Prompt = React.createClass ({
  render: function() {
    return <Line prompt={true} text={Helpers.dedent(this.props.children)}/>;
  }
});

var Output = React.createClass ({
  render: function() {
    return <Line prompt={false} text={Helpers.dedent(this.props.children)}/>;
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

    return Helpers.dedent(string);
  },

  copyCodeToClipboard: function(e) {
    e.preventDefault();

    copy(this.promptLinesAsString());

    this.setState({clicked: false});
  },

  classNames: function() {
    var classNames = [];

    // this.props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    // TODO: Use React.Children. It exists to do this kind of stuff for me.
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
          <div ref="pre" className="content">
            { this.props.children }
          </div>
          <div className="codeblock--buttons">
            <a href="#"
               onMouseOver={function() {this.setState({hovering: true});}.bind(this)}
               onMouseOut={function() {this.setState({hovering: false});}.bind(this)}
               onClick={this.copyCodeToClipboard}
               onMouseUp={function() {this.setState({clicked: true});}.bind(this)}
            >
              <i className="fa fa-clipboard" aria-hidden="true"></i>
            </a>
          </div>
          <ReactCSSTransitionGroup transitionName={`checkmark`} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
            {
              this.state.clicked ? <i className="fa fa-check codeblock--checkmark" aria-hidden="true"></i> : null
            }
          </ReactCSSTransitionGroup>
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