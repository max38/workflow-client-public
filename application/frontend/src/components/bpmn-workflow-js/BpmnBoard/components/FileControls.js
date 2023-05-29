import React from "react";
import { Box } from 'grommet';
import { Button, Icon } from 'UIKit';

import { FilePicker } from 'react-file-picker';


export default ({ onOpenFile, onOpenFileError, onSaveFile, onSaveImage, }) => (
  <Box direction='row' style={{ position: 'absolute', left: 10, bottom: 10 }} >
    <Button.Group size='large'>
      <Button>
        <FilePicker
            extensions={['bpmn']}
            onChange={fileObj => onOpenFile(fileObj)}
            onError={errMsg => onOpenFileError(errMsg)}
          >
            <Icon type="folder-open" />
        </FilePicker>
      </Button>
      <Button onClick={onSaveFile}>
        <Icon type="cloud-download" />
      </Button>
      <Button onClick={onSaveImage}>
        <Icon type="file-image" />
      </Button>
    </Button.Group>
  </Box>
);
