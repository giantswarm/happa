import { dedent } from 'lib/helpers';
import BaseTransition from 'styles/transitions/BaseTransition';
import Line from './Line';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

export const Prompt = ({ children }) => {
  return <Line prompt={true} text={dedent(children)} />;
};

export const Output = ({ children }) => {
  return <Line prompt={false} text={dedent(children)} />;
};

/**
 * Use this to show some commands and output to the user.
 *
 * Users can copy the commands to their clipboard easily.
 *
 * @example
 * ```js
 * <CodeBlock>
 *   <Prompt>
 *     {`kubectl version \\
 *       long \\
 *       command`}
 *   </Prompt>
 *   <Output>
 *     {`output`}
 *   </Output>
 * </CodeBlock>
 * ```
 *
 * Output and Prompt can be in any order.
 *
 * The copy to clipboard button will only take the content in the Prompt tags.
 */
export const CodeBlock = ({ children }) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

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
        <div className='content'>{children}</div>
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
        <BaseTransition
          in={hasContentInClipboard}
          timeout={{ enter: 1000, exit: 1000 }}
          classNames='checkmark'
        >
          <i aria-hidden='true' className='fa fa-done codeblock--checkmark' />
        </BaseTransition>
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
