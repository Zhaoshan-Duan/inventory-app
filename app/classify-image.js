export const classifyImage = async (imageDataUrl) => {
    try {
        const response = await fetch('/api/classify-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageDataUrl }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error classifying image:", error);
        return {
            name: "Unknown",
            description: "Failed to classify image",
            categories: ["Unclassified"],
            estimatedQuantity: "Unknown",
        };
    }
};
