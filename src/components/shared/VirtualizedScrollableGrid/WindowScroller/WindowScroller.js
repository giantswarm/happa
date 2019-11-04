import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  getDimensions,
  getPositionOffset,
  getScrollOffset,
} from './utils/dimensions';
import {
  registerScrollListener,
  unregisterScrollListener,
} from './utils/onScroll';
import createDetectElementResize from './utils/detectElementResize';
import PropTypes from 'prop-types';

/**
 * Specifies the number of miliseconds during which to disable pointer events while a scroll is in progress.
 * This improves performance and makes scrolling smoother.
 */
export const IS_SCROLLING_TIMEOUT = 500;

const getWindow = () => (typeof window !== 'undefined' ? window : undefined);

class WindowScroller extends React.PureComponent {
  static defaultProps = {
    onResize: () => {},
    onScroll: () => {},
    scrollingResetTimeInterval: IS_SCROLLING_TIMEOUT,
    scrollElement: getWindow(),
    serverHeight: 0,
    serverWidth: 0,
  };

  _window = getWindow();
  _isMounted = false;
  _positionFromTop = 0;
  _positionFromLeft = 0;
  _detectElementResize;
  _child;

  state = {
    height: null,
    width: null,
    isScrolling: false,
    scrollLeft: 0,
    scrollTop: 0,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.height === null && prevState.width === null) {
      return { ...getDimensions(nextProps.scrollElement, nextProps) };
    }

    return null;
  }

  componentDidMount() {
    const scrollElement = this.props.scrollElement;

    this._detectElementResize = createDetectElementResize();

    this.updatePosition(scrollElement);

    if (scrollElement) {
      registerScrollListener(this, scrollElement);
      this._registerResizeListener(scrollElement);
    }

    this._isMounted = true;
  }

  componentDidUpdate(prevProps) {
    const { scrollElement } = this.props;
    const { scrollElement: prevScrollElement } = prevProps;

    if (
      prevScrollElement !== scrollElement &&
      prevScrollElement != null &&
      scrollElement != null
    ) {
      this.updatePosition(scrollElement);

      unregisterScrollListener(this, prevScrollElement);
      registerScrollListener(this, scrollElement);

      this._unregisterResizeListener(prevScrollElement);
      this._registerResizeListener(scrollElement);
    }
  }

  componentWillUnmount() {
    const scrollElement = this.props.scrollElement;

    if (scrollElement) {
      unregisterScrollListener(this, scrollElement);
      this._unregisterResizeListener(scrollElement);
    }

    this._isMounted = false;
  }

  updatePosition(scrollElement = this.props.scrollElement) {
    const { onResize } = this.props;
    const { height, width } = this.state;

    const thisNode = this._child || ReactDOM.findDOMNode(this);

    if (thisNode instanceof Element && scrollElement) {
      const offset = getPositionOffset(thisNode, scrollElement);
      this._positionFromTop = offset.top;
      this._positionFromLeft = offset.left;
    }

    const dimensions = getDimensions(scrollElement, this.props);

    if (height !== dimensions.height || width !== dimensions.width) {
      this.setState({
        height: dimensions.height,
        width: dimensions.width,
      });

      onResize({
        height: dimensions.height,
        width: dimensions.width,
      });
    }
  }

  render() {
    const { children } = this.props;
    const { isScrolling, scrollTop, scrollLeft, height, width } = this.state;

    return children({
      onChildScroll: this._onChildScroll,
      registerChild: this._registerChild,
      height,
      isScrolling,
      scrollLeft,
      scrollTop,
      width,
    });
  }

  _registerChild = element => {
    if (element && !(element instanceof Element)) {
      console.warn(
        'WindowScroller registerChild expects to be passed Element or null'
      );
    }

    this._child = element;
    this.updatePosition();
  };

  _onChildScroll = ({ scrollTop }) => {
    if (this.state.scrollTop === scrollTop) {
      return;
    }

    const scrollElement = this.props.scrollElement;
    if (scrollElement) {
      if (typeof scrollElement.scrollTo === 'function') {
        scrollElement.scrollTo(0, scrollTop + this._positionFromTop);
      } else {
        scrollElement.scrollTop = scrollTop + this._positionFromTop;
      }
    }
  };

  _registerResizeListener = element => {
    if (element === window) {
      window.addEventListener('resize', this._onResize, false);
    } else {
      this._detectElementResize.addResizeListener(element, this._onResize);
    }
  };

  _unregisterResizeListener = element => {
    if (element === window) {
      window.removeEventListener('resize', this._onResize, false);
    } else if (element) {
      this._detectElementResize.removeResizeListener(element, this._onResize);
    }
  };

  _onResize = () => {
    this.updatePosition();
  };

  // Referenced by utils/onScroll
  __handleWindowScrollEvent = () => {
    if (!this._isMounted) {
      return;
    }

    const { onScroll, scrollElement } = this.props;

    if (scrollElement) {
      const scrollOffset = getScrollOffset(scrollElement);
      const scrollLeft = Math.max(
        0,
        scrollOffset.left - this._positionFromLeft
      );
      const scrollTop = Math.max(0, scrollOffset.top - this._positionFromTop);

      this.setState({
        isScrolling: true,
        scrollLeft,
        scrollTop,
      });

      onScroll({
        scrollLeft,
        scrollTop,
      });
    }
  };

  // Referenced by utils/onScroll
  __resetIsScrolling = () => {
    this.setState({
      isScrolling: false,
    });
  };
}

WindowScroller.propTypes = {
  children: PropTypes.func,
  onResize: PropTypes.func,
  onScroll: PropTypes.func,
  scrollElement: PropTypes.object,
  scrollingResetTimeInterval: PropTypes.number,
  serverHeight: PropTypes.number,
  serverWidth: PropTypes.number,
};

export default WindowScroller;
