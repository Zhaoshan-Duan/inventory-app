'use client'
import React, { useRef, useState } from 'react';
import { CameraAlt as CameraIcon } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

const CameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [error, setError] = useState(null)

    const startCamera = async () => {
        try {
            console.log("Attempting to start camera...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })

            console.log("Camera stream obtained:", stream)
            setStream(stream)

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    console.log("Video element source set");
                } else {
                    console.error("Video ref is null");
                }
            }, 100)

        } catch (err) {
            console.error("Error accessing the camera:", err);
            setError(`Failed to access camera: ${err.message}`);
        }
    }



    const captureImage = () => {
        if (videoRef.current) {
            console.log("Attempting to capture image...");
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            console.log("Image captured:", imageDataUrl.substring(0, 50) + "...");
            onCapture(imageDataUrl);
            stopCamera();
        } else {
            console.error("Video ref is null when trying to capture");
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        setStream(null)
    }

    return (
        <Box>
            {!stream ? (
                <Button startIcon={<CameraIcon />} onClick={startCamera}>
                    Start Camera
                </Button>
            ) : (
                <>
                    <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '500px' }} />
                    <Button onClick={captureImage}>Capture</Button>
                    <Button onClick={stopCamera}>Stop Camera</Button>
                </>
            )}
        </Box>
    );
}

export default CameraCapture;

