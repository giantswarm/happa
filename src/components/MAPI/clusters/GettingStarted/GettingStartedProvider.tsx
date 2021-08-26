import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

export enum GettingStartedPlatform {
  Linux,
  MacOS,
  Windows,
}

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
  selectedPlatform: GettingStartedPlatform;
  setSelectedPlatform: (platform: GettingStartedPlatform) => void;
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

  const [selectedPlatform, setSelectedPlatform] = useState(
    GettingStartedPlatform.Linux
  );

  return (
    <gettingStartedContext.Provider
      value={{
        homePath,
        currentStepIdx,
        prevStepPath,
        nextStepPath,
        steps,
        selectedPlatform,
        setSelectedPlatform,
      }}
    >
      {children}
    </gettingStartedContext.Provider>
  );
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
