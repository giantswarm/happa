'use strict';

import _ from 'underscore';
import PropTypes from 'prop-types';
import React from 'react';

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
        console.debug(
          'RefreshableLabel detected dataItems change',
          prevProps.dataItems,
          this.props.dataItems
        );
        this.setState({
          changed: true,
        });

        this.changeTimeout = window.setTimeout(() => {
          this.setState({ changed: false });
        }, 5000);
      }
    }
  }

  componentWillUnmount = () => {
    window.clearTimeout(this.changeTimeout);
  };

  render = () => {
    var className = 'refreshable-label';
    if (this.state.changed) {
      className += ' changed';
    }

    return <span className={className}>{this.props.children}</span>;
  };
}

export default RefreshableLabel;

RefreshableLabel.propTypes = {
  children: PropTypes.object,
  dataItems: PropTypes.array,
};
