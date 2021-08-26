import { dedent } from 'lib/helpers';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import React, { useState } from 'react';
import BaseTransition from 'styles/transitions/BaseTransition';

import Line from './Line';
import Styles from './Styles';

/**
 *
 * Use this to show the contents of a file to a user.
 *
 * The user can then easily download the file or copy it to clipboard
 *
 * @example
 * ```js
 * <FileBlock fileName={'my-filename.txt'}>
 * {`
 *   The contents of the file
 *
 *   Indentation
 *   -----------
 *     Indentation should be preserved based on where the first line
 *     started.
 * `}
 * </FileBlock>
 *```
 */
export const FileBlock = ({ children, hideText, fileName }) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyCodeToClipboard = (e) => {
    e.preventDefault();

    const contentToCopy = dedent(children);
    setClipboardContent(contentToCopy);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setClipboardContent(null);
  };

  const getClassNames = () => {
    const classNames = ['codeblock--container'];

    if (isHovering) {
      classNames.push('hovering');
    }
    if (hasContentInClipboard) {
      classNames.push('clicked');
    }
    if (hideText) {
      classNames.push('oneline');
    }

    return classNames.join(' ');
  };

  const getFileAsBlob = () => {
    const blob = new Blob([dedent(children)], {
      type: 'application/plain;charset=utf-8',
    });

    return blob;
  };

  // eslint-disable-next-line react/no-multi-comp
  const downloadAsFileLink = () => {
    return (
      <a download={fileName} href={window.URL.createObjectURL(getFileAsBlob())}>
        <i
          aria-hidden='true'
          className='fa fa-file-download'
          title='Download file'
        />
      </a>
    );
  };

  return (
    <Styles>
      <div className={getClassNames()}>
        <pre>
          <div className='content'>
            <div className='codeblock--filename'>{fileName}</div>
            <div className='codeblock--filecontents'>
              {!hideText && <Line text={dedent(children)} />}
            </div>
          </div>
          <div
            className='codeblock--buttons'
            onMouseOut={() => setHovering(false)}
            onMouseOver={() => setHovering(true)}
          >
            {downloadAsFileLink()}
            <a
              href='#'
              onClick={handleClick}
              onMouseUp={copyCodeToClipboard}
              title='Copy content to clipboard'
            >
              <i aria-hidden='true' className='fa fa-content-copy' />
            </a>
          </div>
          <BaseTransition
            in={hasContentInClipboard}
            timeout={{ enter: 1000, exit: 1000 }}
            classNames='checkmark'
          >
            <i
              aria-hidden='true'
              className='fa fa-done codeblock--checkmark'
              title='Content copied to clipboard'
            />
          </BaseTransition>
        </pre>
      </div>
    </Styles>
  );
};

FileBlock.defaultProps = {
  hideText: false,
};

export default FileBlock;
