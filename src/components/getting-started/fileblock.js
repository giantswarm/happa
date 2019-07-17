import * as Helpers from 'lib/helpers';
import copy from 'copy-to-clipboard';
import Line from './line';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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

class FileBlock extends React.Component {
  state = {
    hovering: false,
  };

  copyCodeToClipboard = e => {
    e.preventDefault();

    copy(Helpers.dedent(this.props.children));

    this.setState({ clicked: false });
  };

  classNames() {
    var classNames = [];

    classNames.push('codeblock--container');
    if (this.state.hovering) {
      classNames.push('hovering');
    }
    if (this.state.clicked) {
      classNames.push('clicked');
    }
    if (this.props.hideText) {
      classNames.push('oneline');
    }

    return classNames.join(' ');
  }

  blob() {
    var blob = new Blob([Helpers.dedent(this.props.children)], {
      type: 'application/plain;charset=utf-8',
    });
    return blob;
  }

  downloadAsFileLink() {
    return (
      <a
        download={this.props.fileName}
        href={window.URL.createObjectURL(this.blob())}
      >
        <i aria-hidden='true' className='fa fa-file-download' />
      </a>
    );
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
            <div className='codeblock--filename'>{this.props.fileName}</div>
            <div className='codeblock--filecontents'>
              {this.props.hideText ? (
                undefined
              ) : (
                <Line text={Helpers.dedent(this.props.children)} />
              )}
            </div>
          </div>
          <div
            className='codeblock--buttons'
            onMouseOut={function() {
              this.setState({ hovering: false });
            }.bind(this)}
            onMouseOver={function() {
              this.setState({ hovering: true });
            }.bind(this)}
          >
            {Modernizr.adownload ? this.downloadAsFileLink() : null}
            <a
              href='#'
              onClick={this.copyCodeToClipboard}
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

FileBlock.propTypes = {
  children: PropTypes.node,
  fileName: PropTypes.string,
  hideText: PropTypes.bool,
};

export default FileBlock;
