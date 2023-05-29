import React from "react";
import { Box } from 'grommet';
import { Button, Icon } from 'UIKit';

export default ({ load_bpmn_data, saveDiagram, onUndo, onRedo, onZoomIn, onZoomOut }) => (
  <Box style={{ position: 'absolute', right: 50, top: 16 }}>
    <Button.Group size='large'>
      <Button onClick={saveDiagram} title='Save'>
        <Icon type="save" /> Save DRAF
      </Button>
      <Button onClick={load_bpmn_data} title='Re-load'>
        <Icon type="reload" />
      </Button>
      <Button onClick={onUndo} style={{borderLeft: "5px solid #d9d9d9"}}>
        <Icon type="undo" />
      </Button>
      <Button onClick={onRedo}>
        <Icon type="redo" />
      </Button>
      <Button onClick={onZoomIn} style={{borderLeft: "5px solid #d9d9d9"}}>
        <Icon type="plus" />
      </Button>
      <Button onClick={onZoomOut}>
        <Icon type="minus" />
      </Button>
    </Button.Group>
  </Box>
);
