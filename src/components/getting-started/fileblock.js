import { dedent } from 'lib/helpers';
import Line from './line';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

// FileBlock
// Use this to show the contents of a file to a user.
// The user can then easily download the file or copy it to clipboard
//
// <FileBlock fileName={'my-filename.txt'}>
// {`
//   The contents of the file
//
//   Indentation
//   -----------
//     Indentation should be preserved based on where the first line
//     started.
// `}
// </FileBlock>
//

var Modernizr = window.Modernizr;

export const FileBlock = ({ children, hideText, fileName }) => {
  const [isHovering, setHovering] = useState(false);
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const preElement = useRef(null);

  const copyCodeToClipboard = e => {
    e.preventDefault();

    const contentToCopy = dedent(children);
    setClipboardContent(contentToCopy);
  };

  const classNames = () => {
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
    <div className={classNames()}>
      <pre>
        <div className='content' ref={preElement}>
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
          <a
            href='#'
            onClick={() => setClipboardContent(null)}
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

FileBlock.propTypes = {
  children: PropTypes.node,
  fileName: PropTypes.string,
  hideText: PropTypes.bool,
};

export default FileBlock;
