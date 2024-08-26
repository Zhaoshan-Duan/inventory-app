"use client";
import { useState, useEffect, useMemo} from "react";
import { firestore } from "@/firebase";
import {
    Box,
    Container,
} from "@mui/material";

import {
    collection,
    doc,
    getDocs,
    runTransaction,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import InventoryList from "./components/InventoryList";
import AddItemModal from "./components/AddItemModal";
import MySnackbar from "./components/MySnackbar";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (term) => setSearchTerm(term);

    const [inventory, setInventory] = useState([]);
    const handleItemAdded = (newItem) => {
        setInventory(prevInventory => [...prevInventory, newItem]);
    };

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });
    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
      
    const fetchInventory = async () => {
        try {
            const itemsRef = collection(firestore, 'inventory');
            const snapshot = await getDocs(itemsRef);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventory(items);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    }

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) =>
            item.userEnteredName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);

    const acceptClassifiedName = async (itemId, classifiedName) => {
        try {
            // Update local state
            const updatedItems = inventory.map(item => 
                item.id === itemId ? {...item, userEnteredName: classifiedName} : item
            );
            setInventory(updatedItems);
    
            // Update Firestore
            const itemRef = doc(firestore, 'inventory', itemId);
            await updateDoc(itemRef, {
                userEnteredName: classifiedName,
                lastUpdated: serverTimestamp()
            });

            setSnackbar({
                open: true,
                message: `Item name updated to "${classifiedName}" successfully`,
                severity: "success",
              });
        } catch (error) {
            console.error("Error updating item name:", error);
            setSnackbar({
                open: true,
                message: `Failed to update item name. ${error.message || 'Please try again.'}`,
                severity: "error",
              });  
        }
    };

    const updateQuantity = async (itemId, change) => {
        const itemRef = doc(firestore, "inventory", itemId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists()) {
                    throw "Document does not exist!";
                }

                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity + change;

                if (newQuantity > 0) {
                    transaction.update(itemRef, { quantity: newQuantity });

                    // Update local state
                    setInventory((prevInventory) =>
                        prevInventory.map((item) =>
                            item.id === itemId ? { ...item, quantity: newQuantity } : item
                        )
                    );
                } else {
                    // If quantity would become 0 or negative, delete the document
                    transaction.delete(itemRef);

                    // Remove item from local state
                    setInventory((prevInventory) =>
                        prevInventory.filter((item) => item.id !== itemId)
                    );
                }
            });

            console.log("Quantity updated successfully");
        } catch (error) {
            console.error("Error updating quantity: ", error);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <Header onAddClick={handleOpenModal} />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <SearchBar onSearch ={handleSearch}/>

                <InventoryList
                    items={filteredInventory}
                    onUpdateQuantity = {updateQuantity}
                    onAcceptClassifiedName={acceptClassifiedName}
                />
            </Container>

            <AddItemModal
                open={isModalOpen}
                onItemAdded={handleItemAdded}
                onClose = {handleCloseModal}
            />
            <MySnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleSnackbarClose}
            />
        </Box>
    );
}
