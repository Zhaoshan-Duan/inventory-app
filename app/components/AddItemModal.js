import { useState } from 'react';
import {
    Modal,
    Fade,
    Box,
    Button,
    Typography,
    IconButton,
    TextField,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Alert,
    Snackbar,
} from '@mui/material'
import {
    Add as AddIcon,
    Close as CloseIcon
} from '@mui/icons-material';

import CameraCapture from '../CameraCapture';
import { classifyImage } from '../classify-image';
import { resizeImage } from '../imageUtils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from "@/firebase";
import MySnackbar from './MySnackbar';

const AddItemModal = ({
    open,
    onItemAdded,
    onClose,
}) => {
    const [itemName, setItemName] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [capturedImage, setCapturedImage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const handleCapture = (imageDataUrl) => {
        setCapturedImage(imageDataUrl);
    };

    const handleClose = () => {
        setCapturedImage(null)
        setItemName("")
        setQuantity(1)
        setIsLoading(false)
        onClose()
    }

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    }

    const addItem = async () => {

        setIsLoading(true);

        let newItemData = {
            userEnteredName: itemName.trim(),
            quantity: quantity,
            categories: [],
            dateAdded: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            isClassified: false
        };

        if (capturedImage) {
            try {
                const resizedImage = await resizeImage(capturedImage, 800);
                newItemData.imageUrl = resizedImage;

                console.log("Starting image classification...");
                const classification = await classifyImage(resizedImage);

                newItemData = {
                    ...newItemData,
                    classifiedName: classification.name,
                    categories: Array.isArray(classification.categories) ? classification.categories : [classification.categories],
                    unit: classification.unit ||  "",
                    ingredients: classification.ingredients || [],
                    culinaryUses: classification.culinaryUses || "",
                    storageInstructions: classification.storageInstructions || "",
                    isClassified: true
                }
            } catch (error) {
                console.error("Error in image classification:", error);
                newItemData.isClassified = false;
            }

            // For manual entry or if classification failed
            if (!newItemData.isClassified) {
                newItemData = {
                    ...newItemData,
                    categories: ["Uncategorized"],
                }
            }

            try {
                const itemsRef = collection(firestore, 'inventory');
                const docRef = await addDoc(itemsRef, newItemData)
                console.log("Item added with ID:", docRef.id);

                setSnackbar({
                    open: true,
                    message: `${itemName} added successfully`,
                    severity: "success",
                })

                onItemAdded({ id: docRef.id, ...newItemData })
                handleClose()

            } catch (error) {
                console.error("Error adding item:", error);
                setSnackbar({
                    open: true,
                    message: `Failed to add ${itemName}. ${error.message || 'Please Try Again.'}`,
                    severity: "error",
                });
            } finally {
                setIsLoading(false)
                console.log(newItemData)
            }
        }
    }

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Fade in={open}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: isMobile ? "90%" : 400,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ mb: 2, fontWeight: "bold" }}
                        >
                            Add New Item
                            <IconButton
                                aria-label="close"
                                onClick={handleClose}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Item Name"
                            fullWidth
                            variant="outlined"
                            value={itemName}
                            onChange={(e) => {
                                setItemName(e.target.value);
                            }}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ mb: 2 }}>
                            <CameraCapture onCapture={handleCapture} />
                        </Box>
                        {capturedImage && (
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <img
                                    src={capturedImage}
                                    alt="Captured item"
                                    style={{
                                        width: "100%",
                                        maxHeight: "200px",
                                        objectFit: "contain",
                                        borderRadius: "4px",
                                    }}
                                />
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={isLoading || !itemName.trim()}
                            onClick={addItem}
                            sx={{ mt: 2 }}
                            startIcon={
                                isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <AddIcon />
                                )
                            }
                        >
                            {isLoading ? "Add..." : "Add Item"}
                        </Button>
                    </Box>
                </Fade>
            </Modal>
            <MySnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleSnackbarClose}
            />

        </>
    )
}

export default AddItemModal