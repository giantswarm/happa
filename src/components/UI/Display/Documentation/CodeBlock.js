import { Keyboard } from 'grommet';
import { dedent } from 'lib/helpers';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import React, { useState } from 'react';
import BaseTransition from 'styles/transitions/BaseTransition';

import Line from './Line';
import Styles from './Styles';

export const Prompt = ({ children }) => {
  return <Line prompt={true} text={dedent(children)} />;
};

Prompt.displayName = 'Prompt';

// eslint-disable-next-line react/no-multi-comp
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
// eslint-disable-next-line react/no-multi-comp
export const CodeBlock = ({ children }) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const getPromptLinesAsString = () => {
    const string = React.Children.toArray(children)
      .filter((x) => x.type.displayName === 'Prompt')
      .map((x) => x.props.children)
      .join('\n');

    return dedent(string);
  };

  const copyCodeToClipboard = (e) => {
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

  const resetClipboard = (e) => {
    e.preventDefault();

    setClipboardContent(null);
  };

  const handleOnFocusKeyDown = (e) => {
    e.preventDefault();

    e.target.click();
  };

  return (
    <Styles>
      <div className={getClassNames()}>
        <pre>
          <div className='content'>{children}</div>
          <div className='codeblock--buttons'>
            <Keyboard
              onSpace={handleOnFocusKeyDown}
              onEnter={handleOnFocusKeyDown}
            >
              <a
                href='#'
                onMouseOut={() => setHovering(false)}
                onMouseOver={() => setHovering(true)}
                onMouseLeave={resetClipboard}
                onClick={copyCodeToClipboard}
              >
                <i
                  role='presentation'
                  className='fa fa-content-copy'
                  aria-label='Copy content to clipboard'
                />
              </a>
            </Keyboard>
          </div>
          <BaseTransition
            in={hasContentInClipboard}
            timeout={{ enter: 1000, exit: 1000 }}
            classNames='checkmark'
          >
            <i
              role='presentation'
              className='fa fa-done codeblock--checkmark'
              title='Content copied to clipboard'
            />
          </BaseTransition>
        </pre>
      </div>
    </Styles>
  );
};
