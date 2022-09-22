import { Box, Button, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import * as docs from 'model/constants/docs';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledIcon = styled(Text).attrs({
  role: 'presentation',
  'aria-hidden': true,
})`
  vertical-align: middle;
  line-height: 1;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('input-highlight', theme)};
`;

interface IGitOpsManagedNoteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  displayNote?: boolean;
}

const GitOpsManagedNote: React.FC<
  React.PropsWithChildren<IGitOpsManagedNoteProps>
> = ({ displayNote = true, ...props }) => {
  const divElement = useRef<HTMLDivElement>(null);

  const handleButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.open(docs.gitopsRestrictions, '_blank');
  };

  return (
    <Box direction='row' align='center' {...props} ref={divElement}>
      {displayNote ? (
        <>
          <StyledIcon
            size='20px'
            margin={{ right: displayNote ? 'small' : 'none' }}
            className='fa fa-gitops'
          />
          <Text size='xsmall'>
            Managed through GitOps -{' '}
            <StyledLink
              target='_blank'
              href={docs.gitopsRestrictions}
              onClick={(e) => {
                e.stopPropagation();
              }}
              rel='noopener noreferrer'
            >
              Learn more
              <StyledIcon
                size='16px'
                margin={{ left: 'xsmall' }}
                className='fa fa-open-in-new'
              />
            </StyledLink>
          </Text>
        </>
      ) : (
        <TooltipContainer
          target={divElement}
          content={
            <Tooltip>Managed through GitOps. Click to learn more.</Tooltip>
          }
        >
          <Button onClick={handleButtonClick}>
            <StyledIcon
              size='20px'
              margin={{ right: displayNote ? 'small' : 'none' }}
              className='fa fa-gitops'
              aria-label='Managed through GitOps. Click to learn more.'
            />
          </Button>
        </TooltipContainer>
      )}
    </Box>
  );
};

export default GitOpsManagedNote;
