import { dedent } from 'lib/helpers';
import Line from './line';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

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
  return <Line prompt={true} text={dedent(children)} />;
};

export const Output = ({ children }) => {
  return <Line prompt={false} text={dedent(children)} />;
};

export const CodeBlock = ({ children }) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const preElement = useRef(null);

  const getPromptLinesAsString = () => {
    const string = React.Children.toArray(children)
      .filter(x => x.type.displayName === 'Prompt')
      .map(x => x.props.children)
      .join('\n');

    return dedent(string);
  };

  const copyCodeToClipboard = e => {
    e.preventDefault();

    const contentToCopy = getPromptLinesAsString();
    setClipboardContent(contentToCopy);
  };

  const getClassNames = () => {
    // props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    const childrenArray = React.Children.toArray(children);

    const classNames = ['codeblock--container'];

    if (isHovering) {
      classNames.push('hovering');
    }
    if (hasContentInClipboard) {
      classNames.push('clicked');
    }
    if (childrenArray.length === 1) {
      classNames.push('oneline');
    }

    return classNames.join(' ');
  };

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    setClipboardContent(null);
  };

  return (
    <div className={getClassNames()}>
      <pre>
        <div className='content' ref={preElement}>
          {children}
        </div>
        <div className='codeblock--buttons'>
          <a
            href='#'
            onClick={handleClick}
            onMouseOut={() => setHovering(false)}
            onMouseOver={() => setHovering(true)}
            onMouseUp={copyCodeToClipboard}
          >
            <i aria-hidden='true' className='fa fa-content-copy' />
          </a>
        </div>
        <ReactCSSTransitionGroup
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
          transitionName={'checkmark'}
        >
          {hasContentInClipboard ? (
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
