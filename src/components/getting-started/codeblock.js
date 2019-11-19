import * as Helpers from 'lib/helpers';
import copy from 'copy-to-clipboard';
import Line from './line';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
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

export const Prompt = ({ children }) => {
  return <Line prompt={true} text={Helpers.dedent(children)} />;
};

export const Output = ({ children }) => {
  return <Line prompt={false} text={Helpers.dedent(children)} />;
};

const getPromptLinesAsString = children => {
  const string = React.Children.toArray(children)
    .filter(x => {
      return x.type.displayName === 'Prompt';
    })
    .map(x => {
      return x.props.children;
    })
    .join('\n');

  return Helpers.dedent(string);
};

export const CodeBlock = ({ children }) => {
  const [isHovering, setHovering] = useState(false);
  const [isClicked, setClicked] = useState(false);

  const preElement = useRef(null);

  const copyCodeToClipboard = e => {
    e.preventDefault();

    const contentToCopy = getPromptLinesAsString(children);

    copy(contentToCopy);
    setClicked(false);
  };

  const classNames = () => {
    // props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    const childrenArray = React.Children.toArray(children);

    const classNames = ['codeblock--container'];

    if (isHovering) {
      classNames.push('hovering');
    }
    if (isClicked) {
      classNames.push('clicked');
    }
    if (childrenArray.length === 1) {
      classNames.push('oneline');
    }

    return classNames.join(' ');
  };

  return (
    <div className={classNames()}>
      <pre>
        <div className='content' ref={preElement}>
          {children}
        </div>
        <div className='codeblock--buttons'>
          <a
            href='#'
            onClick={copyCodeToClipboard}
            onMouseOut={() => {
              setHovering(false);
            }}
            onMouseOver={() => {
              setHovering(true);
            }}
            onMouseUp={() => {
              setClicked(true);
            }}
          >
            <i aria-hidden='true' className='fa fa-content-copy' />
          </a>
        </div>
        <ReactCSSTransitionGroup
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName={'checkmark'}
        >
          {isClicked ? (
            <i aria-hidden='true' className='fa fa-done codeblock--checkmark' />
          ) : null}
        </ReactCSSTransitionGroup>
      </pre>
    </div>
  );
};

Prompt.propTypes = {
  children: PropTypes.node,
};

Output.propTypes = {
  children: PropTypes.node,
};

CodeBlock.propTypes = {
  children: PropTypes.node,
};
