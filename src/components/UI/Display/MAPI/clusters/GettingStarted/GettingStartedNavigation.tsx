import { Box } from 'grommet';
import { useGettingStartedContext } from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'UI/Controls/Button';
import GettingStartedBottomNav from 'UI/Display/Documentation/GettingStartedBottomNav';

interface IGettingStartedNavigationProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const GettingStartedNavigation: React.FC<IGettingStartedNavigationProps> = (
  props
) => {
  const { nextStepPath, prevStepPath, currentStepIdx, steps, homePath } =
    useGettingStartedContext();

  const isHome = currentStepIdx < 0;
  const isFirstStep = currentStepIdx === 0;
  const isPenultimateStep = currentStepIdx === steps.length - 2;

  return (
    <GettingStartedBottomNav {...props}>
      {!isFirstStep && prevStepPath && (
        <Link to={prevStepPath} key='prev-step'>
          <Button>
            <i
              className='fa fa-chevron-left'
              aria-hidden={true}
              role='presentation'
            />{' '}
            Back
          </Button>
        </Link>
      )}

      {isFirstStep && !prevStepPath && (
        <Link to={homePath} key='prev-step'>
          <Button>
            <i
              className='fa fa-chevron-left'
              aria-hidden={true}
              role='presentation'
            />{' '}
            Back
          </Button>
        </Link>
      )}

      {!isPenultimateStep && !isHome && nextStepPath && (
        <Link to={nextStepPath} key='next-step'>
          <Button primary={true}>
            Continue{' '}
            <i
              className='fa fa-chevron-right'
              aria-hidden={true}
              role='presentation'
            />
          </Button>
        </Link>
      )}

      {isPenultimateStep && nextStepPath && (
        <Link to={nextStepPath} key='next-step'>
          <Button primary={true}>
            Finish{' '}
            <i
              className='fa fa-chevron-right'
              aria-hidden={true}
              role='presentation'
            />
          </Button>
        </Link>
      )}

      {isHome && nextStepPath && (
        <Link to={nextStepPath} key='next-step'>
          <Button primary={true}>
            Start{' '}
            <i
              className='fa fa-chevron-right'
              aria-hidden={true}
              role='presentation'
            />
          </Button>
        </Link>
      )}
    </GettingStartedBottomNav>
  );
};

export default GettingStartedNavigation;
