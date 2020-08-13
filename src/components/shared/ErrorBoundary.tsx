import { ErrorReporter } from 'lib/errors';
import PropTypes from 'prop-types';
import React, { Component, ReactNode } from 'react';

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  reportError?: boolean;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  static propTypes = {
    children: PropTypes.element.isRequired,
    fallback: PropTypes.element,
    reportError: PropTypes.bool,
  };

  static defaultProps = {
    reportError: true,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    if (this.props.reportError) {
      ErrorReporter.getInstance().notify(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
