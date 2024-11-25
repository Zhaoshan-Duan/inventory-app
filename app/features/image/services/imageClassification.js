export const imageClassification = async (imageDataUrl) => {
    try {
        console.log("Starting image classification...");

        // Add a basic check for the imageDataUrl
        if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
            throw new Error('Invalid image data');
        }

        const response = await fetch('/api/image/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageDataUrl }),
        });
        if (!response.ok) {
            console.error('Server responded with status:', response.status)
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
