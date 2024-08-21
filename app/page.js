"use client";
import { classifyImage } from "./imageClassification";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
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
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Fade,
    styled,
} from "@mui/material";
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    Camera as CameraIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
} from "@mui/icons-material";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
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
    const [expandedItems, setExpandedItems] = useState({});

    const handleCapture = (imageDataUrl) => {
        setCapturedImage(imageDataUrl);
    };

    const QuantityDisplay = styled(Box)(({ theme }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: "50%",
        width: 40,
        height: 40,
        fontWeight: "bold",
        fontSize: "1.2rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    }));

    const toggleExpand = (name) => {
        setExpandedItems((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

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
                    setInventory((prevInventory) =>
                        prevInventory.filter((i) => i.name != item),
                    );
                } else {
                    const newQuantity = quantity - 1;
                    await setDoc(docRef, { quantity: newQuantity }, { merge: true });
                    setInventory((prevInventory) =>
                        prevInventory.map((i) =>
                            i.name === item ? { ...i, quantity: newQuantity } : i,
                        ),
                    );
                }
            }
        } catch (error) {
            console.error("Error removing item", error);
            setSnackbar({
                open: true,
                message: `Error removing item: ${error.message}`,
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
            setSnackbar({
                open: true,
                message: "Item removed successfully",
                severity: "success",
            });
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

            let updatedData;

            if (docSnap.exists()) {
                console.log("Document exists, updating");
                const existingData = docSnap.data();
                 const newQuantity = (existingData.quantity || 0) + 1;
                updatedData = {
                    ...existingData,
                    quantity: newQuantity,
                };

                await setDoc(docRef, { quantity: newQuantity }, { merge: true });
            } else {
                console.log("Document doesn't exist, creating new");

                updatedData = {
                    quantity: 1,
                    userEnteredName: item,
                    name: item,
                };

                if (!isExisting && capturedImage) {
                    const resizedImage = await resizeImage(capturedImage, 800);
                    updatedData.imageUrl = resizedImage;

                    console.log("Starting image classification...");
                    const classification = await classifyImage(resizedImage);
                    console.log("Image classified for", item, ":", classification);

                    updatedData = {
                        ...updatedData,
                        suggestedName: classification.name,
                        description: classification.description,
                        categories: classification.categories,
                        estimatedQuantity: classification.estimatedQuantity,
                        /**
                                    storageRecommendation: classification.storageRecommendation,
                                    expirationEstimate: classification.expirationEstimate,
                                    nutritionalInfo: classification.nutritionalInfo,
                                    usageSuggestions: classification.usageSuggestions,
                                    */
                    };
                }

                await setDoc(docRef, updatedData);
            }

            console.log("Document updated/created successfully");

            setInventory((prevInventory) => {
                const index = prevInventory.findIndex((i) => i.name === item);
                if (index != -1) {
                    return prevInventory.map((i, idx) =>
                        idx === index ? { ...i, ...updatedData } : i,
                    );
                } else {
                    return [...prevInventory, { name: item, ...updatedData }];
                }
            });

            setSnackbar({
                open: true,
                message: "Item added successfully",
                severity: "success",
            });

            if (!isExisting) {
                setCapturedImage(null);
                setItemName("");
                handleClose();
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

    const acceptSuggestedName = async (item) => {
        setIsLoading(true);
        try {
            const docRef = doc(collection(firestore, "inventory"), item.userEnteredName || item.name);
            await updateDoc(docRef, {
                name: item.suggestedName,
                userEnteredName: item.suggestedName
            });

            setInventory((prevInventory) =>
                prevInventory.map((i) =>
                    i.name === (item.userEnteredName || item.name)
                        ? { ...i, name: item.suggestedName, userEnteredName: item.suggestedName }
                        : i
                )
            );

            setSnackbar({
                open: true,
                message: "Item name updated successfully",
                severity: "success",
            });
        } catch (error) {
            console.error("Error updating item name:", error);
            setSnackbar({
                open: true,
                message: `Error updating item name: ${error.message}`,
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 1 }}
                    >
                        🥘 Pantry Inventory
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={handleOpen}
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                            borderRadius: 2,
                            px: 2,
                        }}
                    >
                        Add New Item
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Searching items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            mb: 0,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover fieldset": {
                                    borderColor: "#1976d2",
                                },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>

                <Grid container spacing={3}>
                    {filteredInventory.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.name}>
                            <Fade in={true} timeout={500}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "0.3s",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    {item.imageUrl ? (
                                        <Box
                                            sx={{
                                                height: 200,
                                                backgroundImage: `url(${item.imageUrl})`,
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

                                    <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                gutterBottom
                                                fontWeight="bold"
                                            >
                                                {item.userEnteredName || item.name}
                                            </Typography>
                                            <QuantityDisplay sx={{ mt: 2 }}>{item.quantity}</QuantityDisplay>
                                        </Box>

                                        {item.suggestedName &&
                                            item.suggestedName !==
                                            (item.userEnteredName || item.name) && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        mt: 1,
                                                        mb:2,
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        Suggested Item Name: {item.suggestedName}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => acceptSuggestedName(item)}
                                                        sx={{ ml: 2 }}
                                                    >
                                                        Use Suggested Name
                                                    </Button>
                                                </Box>
                                            )}

                                        {item.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 1, fontStyle: "italic" }}
                                            >
                                                {item.description}
                                            </Typography>
                                        )}

                                        {item.categories && (
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {item.categories.map((category, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={category}
                                                        size="small"
                                                        sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        <Button
                                            onClick={() => toggleExpand(item.name)}
                                            startIcon={
                                                expandedItems[item.name] ? (
                                                    <ExpandLessIcon />
                                                ) : (
                                                    <ExpandMoreIcon />
                                                )
                                            }
                                            sx={{ mt: 2, textTransform: "none" }}
                                        >
                                            {expandedItems[item.name] ? "Less Info" : "More Info"}
                                        </Button>

                                        <Collapse
                                            in={expandedItems[item.name]}
                                            timeout="auto"
                                            unmountOnExit
                                        >
                                            <List dense>
                                                {item.estimatedQuantity && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="Estimated Quantity"
                                                            secondary={item.estimatedQuantity}
                                                        />
                                                    </ListItem>
                                                )}
                                                {item.storageRecommendation && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="Storage"
                                                            secondary={item.storageRecommendation}
                                                        />
                                                    </ListItem>
                                                )}
                                                {item.expirationEstimate && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="Expiration"
                                                            secondary={item.expirationEstimate}
                                                        />
                                                    </ListItem>
                                                )}
                                                {item.nutritionalInfo &&
                                                    item.nutritionalInfo.calories && (
                                                        <ListItem>
                                                            <ListItemText
                                                                primary="Calories"
                                                                secondary={item.nutritionalInfo.calories}
                                                            />
                                                        </ListItem>
                                                    )}
                                                {item.usageSuggestions &&
                                                    item.usageSuggestions.length > 0 && (
                                                        <ListItem>
                                                            <ListItemText
                                                                primary="Usage Suggestions"
                                                                secondary={item.usageSuggestions.join(", ")}
                                                            />
                                                        </ListItem>
                                                    )}
                                            </List>
                                        </Collapse>
                                    </CardContent>

                                    <CardActions
                                        sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                                    >
                                        <IconButton
                                            onClick={() => {
                                                addItem(item.name, true);
                                            }}
                                            color="primary"
                                            aria-label="increase quantity"
                                        >
                                            <AddIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                removeItem(item.name);
                                            }}
                                            color="seconday"
                                            aria-label="decrease quantity"
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            </Container>

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
                            onClick={() => {
                                addItem(itemName);
                            }}
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
