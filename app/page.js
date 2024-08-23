"use client";
import { useState, useEffect, useMemo} from "react";
import { firestore } from "@/firebase";
import {
    Box,
    Container,
} from "@mui/material";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    setDoc,
    updateDoc,
} from "firebase/firestore";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import InventoryList from "./components/InventoryList";
import AddItemModal from "./components/AddItemModal";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (term) => setSearchTerm(term);

    const [inventory, setInventory] = useState([]);

    const fetchInventory = async () => {
        try {
            const itemsRef = collection(firestore, 'inventory');
            const snapshot = await getDocs(itemsRef);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventory(items);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            // You might want to add some error handling UI here
        }
    }

    const filteredItems = useMemo(() => {
        return inventory.filter((item) =>
            item.userEnteredName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);

    useEffect(() => {
        fetchInventory();
    }, []);

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

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) =>
            item.userEnteredName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);


    const handleItemAdded = (newItem) => {
        setInventory(prevInventory => [...prevInventory, newItem]);
    };

    const acceptClassifiedName = async (item) => {
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
        </Box>
    );
}
