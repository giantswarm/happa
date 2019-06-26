import * as Helpers from '../../lib/helpers';
import copy from 'copy-to-clipboard';
import Line from './line';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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

export class Prompt extends React.Component {
  render() {
    return <Line prompt={true} text={Helpers.dedent(this.props.children)} />;
  }
}

export class Output extends React.Component {
  render() {
    return <Line prompt={false} text={Helpers.dedent(this.props.children)} />;
  }
}

export class CodeBlock extends React.Component {
  state = {
    hovering: false,
  };

  promptLinesAsString() {
    var string = React.Children.toArray(this.props.children)
      .filter(function(x) {
        return x.type === Prompt;
      })
      .map(function(x) {
        return x.props.children;
      })
      .join('\n');

    return Helpers.dedent(string);
  }

  copyCodeToClipboard(e) {
    e.preventDefault();

    copy(this.promptLinesAsString());

    this.setState({ clicked: false });
  }

  classNames() {
    var classNames = [];

    // this.props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    // TODO: Use React.Children. It exists to do this kind of stuff for me.
    var childrenArray = [this.props.children].reduce(function(a, b) {
      return a.concat(b);
    }, []);

    classNames.push('codeblock--container');
    if (this.state.hovering) {
      classNames.push('hovering');
    }
    if (this.state.clicked) {
      classNames.push('clicked');
    }
    if (childrenArray.length === 1) {
      classNames.push('oneline');
    }

    return classNames.join(' ');
  }

  render() {
    return (
      <div className={this.classNames()}>
        <pre>
          <div
            className='content'
            ref={d => {
              this.pre = d;
            }}
          >
            {this.props.children}
          </div>
          <div className='codeblock--buttons'>
            <a
              href='#'
              onClick={this.copyCodeToClipboard.bind(this)}
              onMouseOut={function() {
                this.setState({ hovering: false });
              }.bind(this)}
              onMouseOver={function() {
                this.setState({ hovering: true });
              }.bind(this)}
              onMouseUp={function() {
                this.setState({ clicked: true });
              }.bind(this)}
            >
              <i aria-hidden='true' className='fa fa-content-copy' />
            </a>
          </div>
          <ReactCSSTransitionGroup
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
            transitionName={'checkmark'}
          >
            {this.state.clicked ? (
              <i
                aria-hidden='true'
                className='fa fa-done codeblock--checkmark'
              />
            ) : null}
          </ReactCSSTransitionGroup>
        </pre>
      </div>
    );
  }
}

Prompt.propTypes = {
  children: PropTypes.node,
};

Output.propTypes = {
  children: PropTypes.node,
};

CodeBlock.propTypes = {
  children: PropTypes.node,
};
