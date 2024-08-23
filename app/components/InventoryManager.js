"use client"
import Header from './components/Header'
import SearchBar from './components/SearchBar';
import InventoryList from './InventoryList';
import AddItemModal from './AddItemModal';
import SnackbarMessage from './SnackbarMessage';

import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { classifyImage } from "./imageClassification";
import { resizeImage } from "./imageUtils";
import { classifyImage } from "./imageClassification";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";

import {
    useMediaQuery,
    useTheme,
    Box,
    Button,
    Container,
    IconButton,
    Snackbar,
    Alert,
    styled,
} from "@mui/material";
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
import { resizeImage } from "./imageUtils";
import SnackbarMessage from './SnackbarMessage';

export default function Home() {
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    
    const [searchTerm, setSearchTerm] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [expandedItems, setExpandedItems] = useState({});

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
            const docRef = doc(
                collection(firestore, "inventory"),
                item.userEnteredName || item.name,
            );
            await updateDoc(docRef, {
                name: item.suggestedName,
                userEnteredName: item.suggestedName,
            });

            setInventory((prevInventory) =>
                prevInventory.map((i) =>
                    i.name === (item.userEnteredName || item.name)
                        ? {
                            ...i,
                            name: item.suggestedName,
                            userEnteredName: item.suggestedName,
                        }
                        : i,
                ),
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
            <Header onAddClick={handleOpen} />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <SearchBar value = {searchTerm} onChange = {setSearchTerm}/>
                <InventoryList 
                items = {filteredInventory} 
                onRemove = {removeItem}
                onAcceptSuggestedName={acceptSuggestedName}
                />
            </Container>

            <AddItemModal 
                open = {open}
                onClose = {handleClose}
                onAdd = {addItem}
                isLoading = {isLoading}
                setisLoading = {setIsLoading}
            />

            <SnackbarMessage
            {...snackbar}
            onClose = {() => setSnackbar({...snackbar, open: false})}
            />

        </Box>
    );
}
