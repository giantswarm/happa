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
import _  from 'underscore';
import Line from './line';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Helpers from '../../lib/helpers';

module.exports = React.createClass ({
  getInitialState: function() {
    return {
      hovering: false
    };
  },

  copyCodeToClipboard: function(e) {
    e.preventDefault();

    copy(Helpers.dedent(this.props.children));

    this.setState({clicked: false});
  },

  classNames: function() {
    var classNames = [];

    // this.props.children is either an array or in the case of 1 child
    // just that child object
    // So this makes sure I always have an array, and flattens it.
    var childrenArray = [this.props.children].reduce(function(a, b) {
      return a.concat(b);
    }, []);

    classNames.push('codeblock--container');
    if (this.state.hovering) {classNames.push('hovering');}
    if (this.state.clicked) {classNames.push('clicked');}

    return classNames.join(' ');
  },

  saveFile: function(e) {
    // e.preventDefault();
    // Helpers.saveAs(blob(), this.props.fileName);
  },

  blob: function() {
    var blob = new Blob([Helpers.dedent(this.props.children)], {type: 'application/plain;charset=utf-8'});
    return blob;
  },

  downloadAsFileLink: function() {
    return(
      <a href={window.URL.createObjectURL(this.blob())} download={this.props.fileName}>
        <i className='fa fa-download' aria-hidden='true'></i>
      </a>
    );
  },

  render() {
    return(
      <div className={this.classNames()}>
        <pre>
          <div ref='pre' className='content'>
            <div className='codeblock--filename'>
              { this.props.fileName }
            </div>
            <div className='codeblock--filecontents'>
              <Line text={ Helpers.dedent(this.props.children) } />
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
});