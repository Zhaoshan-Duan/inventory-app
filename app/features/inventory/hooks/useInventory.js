import { useState, useEffect, useMemo, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';

export const useInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch inventory items
    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await inventoryService.fetchInventory();
            setInventory(items);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize inventory on mount
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Filter inventory based on search term
    const filteredInventory = useMemo(() => {
        return inventory.filter((item) =>
            item.userEnteredName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);

    // Add new item
    const addItem = async (itemData) => {
        try {
            const newItem = await inventoryService.addItem(itemData);
            setInventory(prev => [...prev, newItem]);
            return { success: true, item: newItem };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Update item name (e.g., accepting classified name)
    const updateItemName = async (itemId, newName) => {
        try {
            await inventoryService.updateItemName(itemId, newName);
            setInventory(prev => prev.map(item =>
                item.id === itemId ? { ...item, userEnteredName: newName } : item
            ));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId, change) => {
        try {
            const result = await inventoryService.updateQuantity(itemId, change);

            if (result.type === 'update') {
                setInventory(prev => prev.map(item =>
                    item.id === itemId ? { ...item, quantity: result.newQuantity } : item
                ));
            } else if (result.type === 'delete') {
                setInventory(prev => prev.filter(item => item.id !== itemId));
            }

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        inventory: filteredInventory,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        addItem,
        updateItemName,
        updateQuantity,
        refreshInventory: fetchInventory
    };
};