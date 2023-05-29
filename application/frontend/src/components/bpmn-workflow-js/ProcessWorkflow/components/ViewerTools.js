import React from "react";
import { Box } from 'grommet';
import { Button, Icon } from 'UIKit';

export default ({ onZoomIn, onZoomOut }) => (
  <Box >
    <Button.Group size='large'>
      <Button onClick={onZoomIn}>
        <Icon type="plus" />
      </Button>
      <Button onClick={onZoomOut}>
        <Icon type="minus" />
      </Button>
    </Button.Group>
  </Box>
);
