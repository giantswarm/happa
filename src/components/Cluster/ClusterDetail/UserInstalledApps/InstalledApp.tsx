import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Date from 'UI/Display/Date';
import NotAvailable from 'UI/Display/NotAvailable';

const Wrapper = styled(Box)`
  :hover {
    box-shadow: ${({ theme }) => `0 0 0 1px ${theme.global.colors.text.dark}`};
  }

  &[aria-disabled='true'] {
    cursor: default;

    :hover {
      box-shadow: ${({ theme }) => `0 0 0 0 ${theme.global.colors.text.dark}`};
    }
  }
`;

const AppIcon = styled.img`
  width: 36px;
  height: 36px;
`;

interface IInstalledAppProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  name: string;
  version: string;
  onIconError: React.ReactEventHandler<HTMLImageElement>;
  onClick: (e: React.MouseEvent) => void;
  logoUrl?: string;
  deletionTimestamp?: string;
  iconErrors?: Record<string, boolean>;
}

const InstalledApp: React.FC<IInstalledAppProps> = ({
  name,
  logoUrl,
  version,
  deletionTimestamp,
  iconErrors,
  onIconError,
  onClick,
  ...rest
}) => {
  const isDeleting = typeof deletionTimestamp !== 'undefined';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDeleting) return;

    onClick(e);
  };

  return (
    <Wrapper
      role='button'
      aria-disabled={isDeleting}
      tabIndex={isDeleting ? -1 : 0}
      onClick={handleClick}
      direction='row'
      gap='small'
      align='center'
      pad='small'
      round='xsmall'
      background={isDeleting ? 'background-back' : 'background-front'}
      {...rest}
    >
      <Box overflow='hidden' round='xsmall' background='white'>
        {logoUrl && !iconErrors?.hasOwnProperty(logoUrl) && (
          <AppIcon alt={`${name} icon`} onError={onIconError} src={logoUrl} />
        )}
      </Box>

      <Box>
        <Text>{name}</Text>

        {!isDeleting ? (
          <Text size='xsmall' color='text-weak'>
            Chart version: {version || <NotAvailable />}
          </Text>
        ) : (
          <Text size='xsmall' color='text-xweak'>
            Deleted <Date relative={true} value={deletionTimestamp} />
          </Text>
        )}
      </Box>
    </Wrapper>
  );
};

export default InstalledApp;
