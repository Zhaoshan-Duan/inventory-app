"use client";
import { classifyImage } from "./imageClassification";
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import {
    useMediaQuery,
    useTheme,
    CircularProgress,
    Box,
    Modal,
    TextField,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Container,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Snackbar,
    Paper,
} from "@mui/material";
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    Camera as CameraIcon,
} from "@mui/icons-material";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
} from "firebase/firestore";
import CameraCapture from "./CameraCapture";
import { resizeImage } from "./imageUtils";

export default function Home() {
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [capturedImage, setCapturedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCapture = (imageDataUrl) => {
        setCapturedImage(imageDataUrl);
    };

    // update inventory
    const updateInventory = async () => {
        try {
            console.log("Updating inventory...");
            const snapshot = query(collection(firestore, "inventory"));
            const docs = await getDocs(snapshot);
            const inventoryList = [];

            docs.forEach((doc) => {
                inventoryList.push({
                    name: doc.id,
                    ...doc.data(),
                });
            });
            console.log("Inventory updated:", inventoryList);
            setInventory(inventoryList);
        } catch (error) {
            console.error("Error updating inventory:", error);
        }
    };

    const removeItem = async (item) => {
        setIsLoading(true);
        try {
            const docRef = doc(firestore, "inventory", item);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const { quantity } = docSnap.data();
                if (quantity === 1) {
                    await deleteDoc(docRef);
                } else {
                    await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
                }
            }
            await updateInventory();
        } catch (error) {
            console.error("Error removing item", error);
        } finally {
            setIsLoading(true);
        }
    };

    useEffect(() => {
        updateInventory();
    }, []);

    const addItem = async (item, isExisting = false) => {
        if (!item.trim()) {
            setSnackbar({
                open: true,
                message: "Item name cannot be empty",
                severity: "error",
            });
            return;
        }

        setIsLoading(true);

        try {
            const docRef = doc(collection(firestore, "inventory"), item.trim());
            const docSnap = await getDoc(docRef);

            console.log("Adding item:", item);
            console.log("Is existing:", isExisting);
            console.log("Captured image:", capturedImage ? "Yes" : "No");

            if (docSnap.exists()) {
                console.log("Document exists, updating");
                const existingData = docSnap.data();
                const updatedData = {
                    quantity: (existingData.quantity || 0) + 1,
                };

                // Only include fields that are not undefined
                if (existingData.imageUrl) updatedData.imageUrl = existingData.imageUrl;

                /**
                                                                        if (existingData.description)
                                                                            updatedData.description = existingData.description;
                                                                        if (existingData.categories)
                                                                            updatedData.categories = existingData.categories;
                                                                        */

                await setDoc(docRef, updatedData, { merge: true });
            } else {
                console.log("Document doesn't exist, creating new");

                let newData = {
                    quantity: 1,
                };

                if (!isExisting && capturedImage) {
                    const resizedImage = await resizeImage(capturedImage, 800);
                    newData.imageUrl = resizedImage;
                    /**
                                                                                          const classification = await classifyImage(resizedImage);
                                                                                          if (classification) {
                                                                                              const classificationObj = JSON.parse(classification);
                                                                                              newData.description = classificationObj.description;
                                                                                              newData.categories = classificationObj.categories;
                                                                                              console.log("Image classified:", classificationObj);
                                                                                          }
                                                                                          */
                }

                await setDoc(docRef, newData);
            }

            console.log("Document updated/created successfully");
            await updateInventory();
            handleClose();

            setSnackbar({
                open: true,
                message: "Item added successfully",
                severity: "success",
            });

            if (!isExisting) {
                setCapturedImage(null);
                setItemName("");
            }
        } catch (e) {
            console.error("Error adding item:", e);
            setSnackbar({
                open: true,
                message: `Error adding item: ${e.message}`,
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCapturedImage(null);
        setItemName("");
    };

    const filteredInventory = inventory.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "#f0f4f8", minHeight: "100vh" }}>
            <AppBar position="static" sx={{ bgcolor: "#3f51b5" }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: "bold" }}
                    >
                        Pantry Inventory
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={handleOpen}
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.1)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                        }}
                    >
                        Add New Item
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Searching items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 4, bgcolor: "white" }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>

                <Grid container spacing={3}>
                    {filteredInventory.map(({ name, quantity, imageUrl }) => (
                        <Grid item xs={12} sm={6} md={4} key={name}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition: "0.3s",
                                    "&:hover": {
                                        boxShadow: 6,
                                        transform: "translateY(-5px)",
                                    },
                                }}
                            >
                                {imageUrl ? (
                                    <Box
                                        sx={{
                                            height: 200,
                                            backgroundImage: `url(${imageUrl})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: 200,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#e0e0e0",
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No image available
                                        </Typography>
                                    </Box>
                                )}

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Quantity: {quantity}
                                    </Typography>
                                </CardContent>

                                <CardActions
                                    sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            addItem(name, true);
                                        }}
                                        color="primary"
                                        aria-label="increase quantity"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            removeItem(name);
                                        }}
                                        color="seconday"
                                        aria-label="decrease quantity"
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? "90%" : 600,
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
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={isLoading || !itemName.trim()}
                        onClick={() => {
                            addItem(itemName);
                        }}
                        sx={{ mt: 2 }}
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                    >
                        {isLoading ? 'Add...'

                            : "Add Item"}
                    </Button>
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
