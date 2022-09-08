import { Box } from 'grommet';
import { getClusterLabelsWithDisplayInfo } from 'MAPI/clusters/utils';
import React, { ComponentPropsWithoutRef, FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import LabelWrapper from 'UI/Display/Cluster/ClusterLabels/LabelWrapper';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import EditLabelTooltip from './EditLabelTooltip';

const ClusterLabelsWrapper = styled.div<{ showTitle?: boolean }>`
  display: grid;
  grid-template: ${({ showTitle }) =>
    showTitle ? '"title labels" ". bottom"' : '"labels" "bottom"'};
  grid-template-columns: ${({ showTitle }) =>
    showTitle ? '203px 1fr' : 'auto'};
`;

const LabelsWrapper = styled.div`
  grid-area: labels;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: -10px;
`;

const LabelsTitle = styled.span`
  grid-area: title;
  margin: 5px;
`;

const BottomAreaText = styled.span`
  grid-area: bottom;
  font-size: 13px;
`;

const ErrorText = styled(BottomAreaText)`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
  margin-top: 10px;
`;

const NoLabels = styled.div`
  grid-area: labels;
  display: flex;
  align-items: center;
`;

const NoLabelsEditLabelTooltip = styled(EditLabelTooltip)`
  margin-left: ${({ theme }) => theme.global.edgeSize.medium};
`;

interface IClusterLabelsProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  onChange: (patch: ILabelChange) => void;
  labels?: IClusterLabelMap;
  isLoading?: boolean;
  errorMessage?: string;
  showTitle?: boolean;
  unauthorized?: boolean;
  readOnly?: boolean;
}

const ClusterLabels: FC<React.PropsWithChildren<IClusterLabelsProps>> = ({
  labels,
  onChange,
  isLoading,
  errorMessage,
  showTitle,
  unauthorized,
  readOnly,
  ...props
}) => {
  const [allowEditing, setAllowEditing] = useState(true);
  const [displayRawLabels, setDisplayRawLabels] = useState(false);

  const visibleLabels = useMemo(() => {
    if (typeof labels === 'undefined') {
      return undefined;
    }

    return getClusterLabelsWithDisplayInfo(labels, !displayRawLabels);
  }, [labels, displayRawLabels]);

  function handleDisplayChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayRawLabels(e.target.checked);
  }

  const noVisibleLabels = !visibleLabels || visibleLabels.length === 0;
  const noLabels = !labels || Object.keys(labels).length === 0;

  return (
    <ClusterLabelsWrapper showTitle={showTitle} {...props}>
      {showTitle && <LabelsTitle>Labels:</LabelsTitle>}
      <Box>
        {noVisibleLabels ? (
          <NoLabels>
            {noLabels
              ? `This cluster has no labels.`
              : `This cluster has no editable labels.`}
            {!unauthorized && !readOnly && (
              <NoLabelsEditLabelTooltip
                allowInteraction={!isLoading && allowEditing}
                onOpen={(isOpen) => setAllowEditing(isOpen)}
                onSave={onChange}
              />
            )}
          </NoLabels>
        ) : (
          <>
            <LabelsWrapper>
              {visibleLabels &&
                visibleLabels.map((label) => (
                  <LabelWrapper key={label.key}>
                    <EditLabelTooltip
                      allowInteraction={!isLoading && allowEditing}
                      label={label}
                      onOpen={(isOpen) => setAllowEditing(isOpen)}
                      onSave={onChange}
                      unauthorized={unauthorized}
                      readOnly={readOnly}
                      displayRawLabels={displayRawLabels}
                    />
                  </LabelWrapper>
                ))}
              {!unauthorized && !readOnly && (
                <EditLabelTooltip
                  allowInteraction={!isLoading && allowEditing}
                  onOpen={(isOpen) => setAllowEditing(isOpen)}
                  onSave={onChange}
                />
              )}
            </LabelsWrapper>
            {errorMessage && (
              <ErrorText>Could not save labels. Please try again.</ErrorText>
            )}
          </>
        )}
        <CheckBoxInput
          toggle={true}
          margin={{ top: 'medium' }}
          label='Display raw labels'
          contentProps={{
            pad: 'none',
          }}
          defaultChecked={displayRawLabels}
          onChange={handleDisplayChange}
        />
      </Box>
    </ClusterLabelsWrapper>
  );
};

ClusterLabels.defaultProps = {
  showTitle: true,
};

export default ClusterLabels;
