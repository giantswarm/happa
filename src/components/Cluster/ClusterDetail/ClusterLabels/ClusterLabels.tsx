import styled from '@emotion/styled';
import { V5ClusterLabelsProperty } from 'giantswarm';
import PropTypes from 'prop-types';
import React, { ComponentPropsWithoutRef, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateClusterLabels } from 'stores/clusterlabels/actions';
import {
  getClusterLabelsError,
  getClusterLabelsLoading,
} from 'stores/clusterlabels/selectors';
import LabelWrapper from 'UI/ClusterLabels/LabelWrapper';

import DeleteLabelButton from './DeleteLabelButton';
import EditLabelTooltip from './EditLabelTooltip';

interface IClusterLabelsProps extends ComponentPropsWithoutRef<'div'> {
  clusterId: string;
  labels: V5ClusterLabelsProperty;
}

const ClusterLabelsWrapper = styled.div`
  display: grid;
  grid-template: 'title labels' '. bottom';
  grid-template-columns: 203px 1fr;
`;

const LabelsWrapper = styled.div`
  grid-area: labels;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
`;

const LabelsTitle = styled.span`
  grid-area: title;
  margin: 5px;
`;

const BottomAreaText = styled.span`
  grid-area: bottom;
  font-size: 13px;
`;

const HelpText = styled(BottomAreaText)`
  u {
    text-decoration-style: dotted;
  }
`;

const ErrorText = styled(BottomAreaText)`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
`;

const NoLabels = styled.div`
  grid-area: labels;
  display: flex;
  align-items: center;
`;

const NoLabelsEditLabelTooltip = styled(EditLabelTooltip)`
  margin-left: ${({ theme }) => theme.spacingPx * 2}px;
`;

const ClusterLabels: FC<IClusterLabelsProps> = ({
  className,
  clusterId,
  labels,
}) => {
  const [allowEditing, setAllowEditing] = useState(true);

  const noLabels = !labels || Object.keys(labels).length === 0;

  const dispatch = useDispatch();

  const loading = useSelector(getClusterLabelsLoading);
  const error = useSelector(getClusterLabelsError);

  const save: (change: ILabelChange) => void = (change) => {
    dispatch(updateClusterLabels({ clusterId, ...change }));
  };

  return (
    <ClusterLabelsWrapper className={className}>
      <LabelsTitle>Labels:</LabelsTitle>
      {noLabels ? (
        <NoLabels>
          This cluster has no labels.
          <NoLabelsEditLabelTooltip
            allowInteraction={!loading && allowEditing}
            label=''
            onOpen={(isOpen) => setAllowEditing(isOpen)}
            onSave={save}
            value=''
          />
        </NoLabels>
      ) : (
        <>
          <LabelsWrapper>
            {Object.entries(labels).map(([label, value]) => (
              <LabelWrapper key={label}>
                <EditLabelTooltip
                  allowInteraction={!loading && allowEditing}
                  label={label}
                  onOpen={(isOpen) => setAllowEditing(isOpen)}
                  onSave={save}
                  value={value}
                />
                <DeleteLabelButton
                  allowInteraction={!loading && allowEditing}
                  onOpen={(isOpen) => setAllowEditing(isOpen)}
                  onDelete={() => {
                    save({ key: label, value: null });
                  }}
                  role='button'
                  aria-label={`Delete '${label}' label`}
                >
                  &times;
                </DeleteLabelButton>
              </LabelWrapper>
            ))}
            <EditLabelTooltip
              allowInteraction={!loading && allowEditing}
              label=''
              onOpen={(isOpen) => setAllowEditing(isOpen)}
              onSave={save}
              value=''
            />
          </LabelsWrapper>
          {error ? (
            <ErrorText>Could not save labels. Please try again.</ErrorText>
          ) : (
            <HelpText>
              Click the <u>underlined</u> text to modify label keys and values.
            </HelpText>
          )}
        </>
      )}
    </ClusterLabelsWrapper>
  );
};

ClusterLabels.propTypes = {
  className: PropTypes.string,
  clusterId: PropTypes.string.isRequired,
  // @ts-ignore
  labels: PropTypes.object.isRequired,
};

export default ClusterLabels;
