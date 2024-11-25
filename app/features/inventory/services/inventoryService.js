import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";
import { firestore } from "@/app/shared/utils/firebase";

export const inventoryService = {
    async fetchInventory() {
        try {
            const itemsRef = collection(firestore, 'inventory');
            const snapshot = await getDocs(itemsRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching inventory:", error);
            throw error;
        }
    },

    // Add new inventory item
    async addItem(itemData) {
        try {
            const itemsRef = collection(firestore, 'inventory');
            const newItemData = {
                ...itemData,
                dateAdded: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            };
            const docRef = await addDoc(itemsRef, newItemData);
            return { id: docRef.id, ...newItemData };
        } catch (error) {
            console.error("Error adding item:", error);
            throw error;
        }
    },

    // Update item's classified name
    async updateItemName(itemId, newName) {
        try {
            const itemRef = doc(firestore, 'inventory', itemId);
            await updateDoc(itemRef, {
                userEnteredName: newName,
                lastUpdated: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating item name:", error);
            throw error;
        }
    },

    // Update item quantity
    async updateQuantity(itemId, change) {
        const itemRef = doc(firestore, "inventory", itemId);

        try {
            const result = await runTransaction(firestore, async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists()) {
                    throw new Error("Document does not exist!");
                }

                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity + change;

                if (newQuantity > 0) {
                    transaction.update(itemRef, {
                        quantity: newQuantity,
                        lastUpdated: serverTimestamp()
                    });
                    return { type: 'update', newQuantity };
                } else {
                    transaction.delete(itemRef);
                    return { type: 'delete' };
                }
            });

            return result;
        } catch (error) {
            console.error("Error updating quantity:", error);
            throw error;
        }
    }
};