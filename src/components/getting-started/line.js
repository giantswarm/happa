import PropTypes from 'prop-types';
import React from 'react';

// Line
// Used in CodeBlock and FileBlock
// <Line prompt={true} text='Some text' />;
//
// prompt: Display this line as a prompt or not (adds the dollar sign before the text)
// text: The text that this line should display

class Line extends React.Component {
  render() {
    return (
      <div
        className={
          this.props.prompt
            ? 'codeblock--line codeblock--prompt'
            : 'codeblock--line'
        }
      >
        <span className='codeblock--prompt-indicator'>
          {this.props.prompt ? '$ ' : null}
        </span>
        {this.props.text}
      </div>
    );
  }
}

Line.propTypes = {
  prompt: PropTypes.bool,
  text: PropTypes.string,
};

export default Line;
