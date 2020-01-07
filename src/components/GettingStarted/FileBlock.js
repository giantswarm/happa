import { dedent } from 'lib/helpers';
import BaseTransition from 'styles/transitions/BaseTransition';
import Line from './Line';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

const Modernizr = window.Modernizr;

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

  const copyCodeToClipboard = e => {
    e.preventDefault();

    const contentToCopy = dedent(children);
    setClipboardContent(contentToCopy);
  };

  const handleClick = e => {
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

  const downloadAsFileLink = () => {
    return (
      <a download={fileName} href={window.URL.createObjectURL(getFileAsBlob())}>
        <i aria-hidden='true' className='fa fa-file-download' />
      </a>
    );
  };

  return (
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
          {Modernizr.adownload ? downloadAsFileLink() : null}
          <a href='#' onClick={handleClick} onMouseUp={copyCodeToClipboard}>
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

FileBlock.propTypes = {
  children: PropTypes.node,
  fileName: PropTypes.string,
  hideText: PropTypes.bool,
};

export default FileBlock;
