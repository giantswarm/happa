'use strict';

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
import React from 'react';
import copy from 'copy-to-clipboard';
import Line from './line';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as Helpers from '../../lib/helpers';
import PropTypes from 'prop-types';

class FileBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovering: false
    };
  }

  copyCodeToClipboard = (e) => {
    e.preventDefault();

    copy(Helpers.dedent(this.props.children));

    this.setState({clicked: false});
  }

  classNames() {
    var classNames = [];

    classNames.push('codeblock--container');
    if (this.state.hovering) {classNames.push('hovering');}
    if (this.state.clicked) {classNames.push('clicked');}
    if (this.props.hideText) {classNames.push('oneline');}

    return classNames.join(' ');
  }

  blob() {
    var blob = new Blob([Helpers.dedent(this.props.children)], {type: 'application/plain;charset=utf-8'});
    return blob;
  }

  downloadAsFileLink() {
    return(
      <a href={window.URL.createObjectURL(this.blob())} download={this.props.fileName}>
        <i className='fa fa-download' aria-hidden='true'></i>
      </a>
    );
  }

  render() {
    return(
      <div className={this.classNames()}>
        <pre>
          <div ref={(d) => {this.pre = d;}} className='content'>
            <div className='codeblock--filename'>
              { this.props.fileName }
            </div>
            <div className='codeblock--filecontents'>
            {
              this.props.hideText
              ?
              undefined
              :
              <Line text={ Helpers.dedent(this.props.children) } />
            }
            </div>
          </div>
          <div className='codeblock--buttons'
               onMouseOver={function() {this.setState({hovering: true});}.bind(this)}
               onMouseOut={function() {this.setState({hovering: false});}.bind(this)}>
            {
              Modernizr.adownload ? this.downloadAsFileLink() : null
            }
            <a href='#' onClick={this.copyCodeToClipboard} onMouseUp={function() {this.setState({clicked: true});}.bind(this)}>
              <i className='fa fa-clipboard' aria-hidden='true'></i>
            </a>
          </div>
          <ReactCSSTransitionGroup transitionName={'checkmark'} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
            {
              this.state.clicked ? <i className='fa fa-check codeblock--checkmark' aria-hidden='true'></i> : null
            }
          </ReactCSSTransitionGroup>
        </pre>
      </div>
    );
  }
}

FileBlock.propTypes = {
  children: PropTypes.node,
  fileName: PropTypes.string,
  hideText: PropTypes.bool
};

export default FileBlock;
