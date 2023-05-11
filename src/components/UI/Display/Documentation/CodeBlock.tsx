import { Keyboard } from 'grommet';
import React, { useState } from 'react';
import BaseTransition from 'styles/transitions/BaseTransition';
import { dedent } from 'utils/helpers';
import useCopyToClipboard from 'utils/hooks/useCopyToClipboard';

import Line from './Line';
import Styles from './Styles';

export const Prompt: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Line prompt={true} text={children ? dedent(children.toString()) : ''} />
  );
};

Prompt.displayName = 'Prompt';

// eslint-disable-next-line react/no-multi-comp
export const Output: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Line prompt={false} text={children ? dedent(children.toString()) : ''} />
  );
};

interface ICodeBlockProps {
  withCopy?: boolean;
}

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
export const CodeBlock: React.FC<React.PropsWithChildren<ICodeBlockProps>> = ({
  withCopy = true,
  children,
}) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const getPromptLinesAsString = () => {
    const string = React.Children.toArray(children)
      // @ts-expect-error
      .filter((x) => x.type.displayName === 'Prompt')
      .map((x) => (x as React.ReactElement).props.children)
      .join('\n');

    return dedent(string);
  };

  const copyCodeToClipboard = (e: React.MouseEvent) => {
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

  const resetClipboard = (e: React.MouseEvent) => {
    e.preventDefault();

    setClipboardContent(null);
  };

  const handleOnFocusKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <Styles>
      <div className={getClassNames()}>
        <pre className={!withCopy ? 'content__no-hover' : ''}>
          <div className='content'>{children}</div>
          {withCopy && (
            <>
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
            </>
          )}
        </pre>
      </div>
    </Styles>
  );
};
