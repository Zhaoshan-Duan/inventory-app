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
                        Analyze this image of an item and identify possible categories for inventory management, provide a JSON object with the following structure: 
                            {
                                "name": "Item name",
                                "description": "Brief description of the item",
                                "categories": "[Category1, Category2]",
                                "estimatedQuantity: "Estimated quantity or unit (e.g., '1 bottle', '500g')"
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
