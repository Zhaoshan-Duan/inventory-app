import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const classifyImage = async (imageDataUrl) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
                        Analyze this image of an item and 
                        identify possible categories for pantry inventory management, 
                        provide a JSON object with the following structure: 
                            {
                                "name": "Item name",
                                "categories": "[Category1, Category2]",
                                "unit": "unit of the item"
                                "ingredients": [Ingredient1, Ingredient2],
                                "culinaryUses": "suggestion on how to use this in cooking"
                                "storageInstructions": "how to store this item"
                            }
                        Ensure the response is a valid JSON object. Don't wrap the response in '''json ''', just plain text.
                        `,
                        },

                        {
                            type: "image_url",
                            image_url: {
                                url: imageDataUrl,
                            },
                        },
                    ],
                },
            ],
        });

        const result = response.choices[0].message.content;
        console.log("Image classication result: ", result);

        const parsedResult = JSON.parse(result);
        parsedResult.categories = Array.isArray(parsedResult.categories)
            ? parsedResult.categories
            : [parsedResult.categories];
        console.log("Parsed classification result:", parsedResult);
        return parsedResult;
    } catch (error) {
        console.error("Error classifying image:", error);
        return {
            name: "Unknown",
            description: "Failed to classify image",
            categories: ["Unclassified"],
            estimatedQuantity: "Unknown",
        }
    }
};
