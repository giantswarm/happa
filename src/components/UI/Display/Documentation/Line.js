import React from 'react';

// Line
// Used in CodeBlock and FileBlock
// <Line prompt={true} text='Some text' />;
//
// prompt: Display this line as a prompt or not (adds the dollar sign before the text)
// text: The text that this line should display

const Line = ({ prompt, text }) => (
  <div
    className={prompt ? 'codeblock--line codeblock--prompt' : 'codeblock--line'}
  >
    <span className='codeblock--prompt-indicator'>{prompt ? '$ ' : null}</span>
    {text}
  </div>
);

export default Line;
