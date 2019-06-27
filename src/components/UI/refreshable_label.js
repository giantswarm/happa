import { withTheme } from 'emotion-theming';
import _ from 'underscore';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import styled from '@emotion/styled';

const Wrapper = withTheme(
  styled.span(() => ({
    display: 'inline-block',
    lineHeight: 1.7,
    borderRadius: 2,
    marginLeft: -5,
    paddingLeft: 5,
    paddingRight: 5,
    '&.changed': {
      animationName: 'yellowfade',
      animationDuration: '2s',
      animationTimingFunction: 'ease',
    },
    '@keyframes yellowfade': {
      from: {
        background: '#e8d986',
      },
      to: {
        background: 'transparent',
      },
    },
  }))
);

/**
 * RefreshableLabel is an inline-block HTML container
 * that is used to temporarily highlight its content.
 *
 * It is typically used to indicated that its content
 * has changed. To detect a change, it provides a property
 *
 *   dataItems (Array)
 *
 * which is an array of arbitrary values. When this
 * array changes, visual highlighting is triggered.
 *
 * Note: props.setTimeout is added via ReactTimeout.
 */
class RefreshableLabel extends React.Component {
  constructor(props) {
    super();
    this.state = {
      dataItems: props.dataItems,
      changed: false,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    var d = _.difference(prevState.dataItems, nextProps.dataItems);
    if (_.size(d) === 0) {
      return null;
    }

    return {
      dataItems: nextProps.dataItems,
    };
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.dataItems !== null &&
      prevState.dataItems !== this.state.dataItems
    ) {
      if (prevState.dataItems !== null) {
        this.setState({
          changed: true,
        });

        this.props.setTimeout(() => {
          this.setState({ changed: false });
        }, 5000);
      }
    }
  }

  render() {
    return (
      <Wrapper className={this.state.changed ? 'changed' : null}>
        {this.props.children}
      </Wrapper>
    );
  }
}

export default ReactTimeout(RefreshableLabel);

RefreshableLabel.propTypes = {
  children: PropTypes.object,
  dataItems: PropTypes.array,
  setTimeout: PropTypes.func,
};
