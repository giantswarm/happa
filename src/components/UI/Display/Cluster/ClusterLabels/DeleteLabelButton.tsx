import React, { ComponentPropsWithRef, FC } from 'react';
import Button from 'UI/Controls/Button';

interface IButtonProps extends ComponentPropsWithRef<typeof Button> {}

const DeleteLabelButton: FC<IButtonProps> = (props) => (
  <Button size='small' link={true} {...props} />
);

export default DeleteLabelButton;
