'use client'
import React, { useRef, useState, useCallback} from 'react';
import  CameraIcon  from '@mui/icons-material/Camera';
import { Box, Button } from '@mui/material';
import { Camera } from 'react-camera-pro';

const CameraCapture = ({ onCapture }) => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = useCallback(() => {
    setIsCameraOn(true);
  }, []);

  const stopCamera = useCallback(() => {
    setIsCameraOn(false);
    setImage(null);
  }, []);

  const captureImage = useCallback(() => {
    if (camera.current) {
      const photoData = camera.current.takePhoto();
      setImage(photoData);
      onCapture(photoData);
    }
  }, [onCapture]);

  return (
 <Box sx={{ mt: 2 }}>
      {!isCameraOn ? (
        <Button variant="contained" onClick={startCamera}>
          Start Camera
        </Button>
      ) : (
        <Box>
          <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
            <Camera ref={camera} />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={captureImage}>
              Capture
            </Button>
            <Button variant="outlined" onClick={stopCamera}>
              Stop Camera
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CameraCapture;
