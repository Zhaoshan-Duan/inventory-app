"use client";
import { useState } from "react";
import {
    Box,
    Container,
} from "@mui/material";

import Component_Header from "@/app/shared/components/component_Header";
import Component_SearchBar from "@/app/shared/components/component_SearchBar";
import Component_InventoryList from "@/app/features/inventory/components/InventoryList/component_InventoryList";
import Component_AddItemModal from "@/app/features/inventory/components/AddItemModal/component_AddItemModal";
import Component_MySnackbar from "@/app/shared/components/component_MySnackbar";
import { useInventory } from "@/app/features/inventory/hooks/useInventory";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const {
        inventory,
        isLoading,
        error,
        setSearchTerm,
        addItem,
        updateItemName,
        updateQuantity
    } = useInventory();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

    const handleItemAdded = async (newItemData) => {
        const result = await addItem(newItemData);
        if (result.success) {
            setSnackbar({
                open: true,
                message: `${newItemData.userEnteredName} added successfully`,
                severity: "success",
            });
            handleCloseModal();
        } else {
            setSnackbar({
                open: true,
                message: `Failed to add item: ${result.error}`,
                severity: "error",
            });
        }
    };

    const handleAcceptClassifiedName = async (itemId, classifiedName) => {
        const result = await updateItemName(itemId, classifiedName);
        setSnackbar({
            open: true,
            message: result.success
                ? `Item name updated to "${classifiedName}" successfully`
                : `Failed to update item name: ${result.error}`,
            severity: result.success ? "success" : "error",
        });
    };

    if (error) {
        setSnackbar({
            open: true,
            message: `Error: ${error}`,
            severity: "error",
        });
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <Component_Header onAddClick={handleOpenModal} />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Component_SearchBar onSearch={setSearchTerm} />

                <Component_InventoryList
                    items={inventory}
                    onUpdateQuantity={updateQuantity}
                    onAcceptClassifiedName={handleAcceptClassifiedName}
                />
            </Container>

            <Component_AddItemModal
                open={isModalOpen}
                onItemAdded={handleItemAdded}
                onClose={handleCloseModal}
            />
            <Component_MySnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleSnackbarClose}
            />
        </Box>
    );
}