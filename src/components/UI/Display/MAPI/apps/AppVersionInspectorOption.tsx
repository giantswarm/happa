import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import Date from 'UI/Display/Date';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';

const StyledText = styled(Text)`
  line-height: unset;
`;

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IAppVersionInspectorOptionProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  version?: string;
  creationDate?: string;
  upstreamVersion?: string;
  isSelected?: boolean;
  isCurrent?: boolean;
}

const AppVersionInspectorOption: React.FC<
  React.PropsWithChildren<IAppVersionInspectorOptionProps>
> = ({
  version,
  creationDate,
  upstreamVersion,
  isSelected,
  isCurrent,
  ...props
}) => {
  const textWeight = isSelected ? 'bold' : 'normal';

  return (
    <Box
      pad={{ horizontal: 'small', vertical: '7px' }}
      direction='row'
      gap='xsmall'
      align='center'
      {...props}
    >
      <OptionalValue
        value={version}
        loaderWidth={100}
        flashOnValueChange={false}
      >
        {(value) => (
          <Truncated as={Text} numStart={10} weight={textWeight}>
            {value}
          </Truncated>
        )}
      </OptionalValue>
      <StyledText weight={textWeight}>
        <StyledDot />
      </StyledText>
      <OptionalValue
        value={creationDate}
        loaderWidth={100}
        flashOnValueChange={false}
      >
        {(value) => (
          <StyledText weight={textWeight}>
            released <Date value={value} relative={true} />
          </StyledText>
        )}
      </OptionalValue>

      <StyledText weight={textWeight}>
        <StyledDot />
      </StyledText>

      <OptionalValue
        value={upstreamVersion}
        loaderWidth={100}
        flashOnValueChange={false}
      >
        {(value) => (
          <StyledText weight={textWeight}>
            includes upstream version {value}
          </StyledText>
        )}
      </OptionalValue>

      {isCurrent && (
        <>
          {' '}
          <StyledText color='text-weak'>(current version)</StyledText>
        </>
      )}
    </Box>
  );
};

export default AppVersionInspectorOption;
