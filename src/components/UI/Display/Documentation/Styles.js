import styled from 'styled-components';

const Styles = styled.div`
  .codeblock--container {
    font-family: 'Inconsolata';
    line-height: 24px;
  }
  .codeblock--container:hover pre,
  .codeblock--container:focus-within pre {
    background-color: #3d3d3d;
  }
  .codeblock--container:hover .codeblock--buttons,
  .codeblock--container:focus-within .codeblock--buttons {
    background-color: #276996;
  }
  .codeblock--container pre {
    background-color: #333333;
    padding: 9px 13px;
    border-radius: 10px;
    position: relative;
    transition: background-color 0.02s linear;
    border: none;
    line-height: auto;
    padding-right: 55px;
    overflow: visible;
    font-size: 15px;

    var {
      font-style: normal;
    }
  }
  .codeblock--container .content {
    overflow-x: auto;
    white-space: pre;
  }
  .codeblock--container .content::-webkit-scrollbar {
    background-color: #333333;
    border-radius: 5px;
    height: 10px;
  }
  .codeblock--container .content::-webkit-scrollbar-track {
    background-color: #303030;
    border-radius: 5px;
  }
  .codeblock--container .content::-webkit-scrollbar-thumb {
    background-color: #4a4a4a;
    border-radius: 5px;
  }
  .codeblock--container .codeblock--filename {
    font-family: 'Inconsolata';
    color: #189de9;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .codeblock--container .codeblock--buttons {
    position: absolute;
    height: 40px;
    top: 0px;
    right: 0px;
    border-top-right-radius: 10px;
    border-bottom-left-radius: 10px;
    transition: background-color 0.02s linear;
    z-index: 10;
  }
  .codeblock--container .codeblock--buttons a {
    text-decoration: none;
    display: inline-block;
    height: 100%;
    padding: 0px 14px;
    color: #aaa;
    line-height: 40px;
  }
  .codeblock--container .codeblock--buttons a:hover,
  .codeblock--container .codeblock--buttons a:focus-visible {
    color: #fff;
  }
  .codeblock--container .codeblock--buttons a:first-child {
    padding-left: 18px;
    padding-right: 5px;
  }
  .codeblock--container .codeblock--buttons a:last-child {
    padding-left: 14px;
    padding-right: 14px;
  }
  .codeblock--container .codeblock--buttons:active {
    background-color: #225b82;
  }
  .codeblock--container .codeblock--line {
    font-family: 'Inconsolata';
    transition: color 0.02s linear;
    color: #d6d7d1;
  }
  .codeblock--container .codeblock--line .codeblock--prompt-indicator {
    color: #189de9;
  }
  .codeblock--container .codeblock--copy-confirmation {
    color: #a4e405;
    opacity: 0;
    margin-left: 10px;
    transition: opacity 0.1s linear;
  }
  .codeblock--container .codeblock--copy-confirmation.visible {
    opacity: 1;
  }
  .codeblock--container .codeblock--checkmark {
    top: 10px;
    right: -30px;
    position: absolute;
    z-index: 0;
    color: #189de9;
  }
  .codeblock--container.oneline .codeblock--buttons {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 10px;
  }
  .codeblock--container.oneline .codeblock--filename {
    margin-bottom: 0px;
  }
  .codeblock--container.hovering .codeblock--line {
    color: #695e55;
  }
  .codeblock--container.hovering .codeblock--filecontents .codeblock--line {
    color: #fff;
  }
  .codeblock--container.hovering .codeblock--filename {
    font-family: 'Inconsolata';
    color: #189de9;
    font-weight: 700;
  }
  .codeblock--container.hovering .codeblock--line.codeblock--prompt {
    color: #fff;
  }
  .codeblock--container.hovering
    .codeblock--line.codeblock--prompt
    .codeblock--prompt-indicator {
    color: #556d78;
  }
  .codeblock--container.clicked .codeblock--line.codeblock--prompt {
    color: #cdd3d6;
  }

  .codeblock--checkmark {
    opacity: 1;
    transform: scale(0, 0);
  }

  .checkmark-enter {
    opacity: 1;
    transform: scale(0.2, 0.2);
    transition: all 0.2s cubic-bezier(0, -0.41, 0.19, 1.44);
  }

  .checkmark-enter.checkmark-enter-active {
    opacity: 1;
    transform: scale(1.5, 1.5);
  }

  .checkmark-exit {
    opacity: 1;
    transition: all 0.5s cubic-bezier(0.87, -0.41, 0.19, 1.44);
    transform: scale(1.2, 1.2) rotate(0deg);
  }

  .checkmark-exit.checkmark-exit-active {
    opacity: 0;
    transform: scale(0.1, 0.1) rotate(270deg);
    right: 0px !important;
  }
`;

export default Styles;
