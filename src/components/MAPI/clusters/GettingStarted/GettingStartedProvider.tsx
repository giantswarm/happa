import PropTypes from 'prop-types';
import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router';

export interface IGettingStartedStep {
  title: string;
  description: string;
  url: string;
  path: string;
  component: React.ComponentType;
}

export interface IGettingStartedContext {
  homePath: string;
  steps: readonly IGettingStartedStep[];
  currentStepIdx: number;
  prevStepPath: string | null;
  nextStepPath: string | null;
}

const gettingStartedContext = createContext<IGettingStartedContext | null>(
  null
);

interface IGettingStartedProviderProps {
  homePath: string;
  steps: IGettingStartedStep[];
}

const GettingStartedProvider: React.FC<
  React.PropsWithChildren<IGettingStartedProviderProps>
> = ({ homePath, steps, children }) => {
  const { pathname } = useLocation();

  const currentStepIdx = useMemo(
    () => steps.findIndex((s) => s.url === pathname),
    [steps, pathname]
  );

  const nextStepPath = useMemo(() => {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx >= steps.length) {
      return null;
    }

    return steps[nextIdx].url;
  }, [currentStepIdx, steps]);

  const prevStepPath = useMemo(() => {
    const nextIdx = currentStepIdx - 1;
    if (nextIdx < 0) {
      return null;
    }

    return steps[nextIdx].url;
  }, [currentStepIdx, steps]);

  return (
    <gettingStartedContext.Provider
      value={{
        homePath,
        currentStepIdx,
        prevStepPath,
        nextStepPath,
        steps,
      }}
    >
      {children}
    </gettingStartedContext.Provider>
  );
};

GettingStartedProvider.propTypes = {
  homePath: PropTypes.string.isRequired,
  steps: PropTypes.array.isRequired,
  children: PropTypes.node,
};

export default GettingStartedProvider;

export function useGettingStartedContext(): IGettingStartedContext {
  const value = useContext(gettingStartedContext);
  if (!value) {
    throw new Error(
      'useGettingStartedContext must be used within a GettingStartedProvider.'
    );
  }

  return useMemo(() => value, [value]);
}
