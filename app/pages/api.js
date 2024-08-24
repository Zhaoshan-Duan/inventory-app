import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { imageDataUrl } = req.body;
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
            console.log("Image classification result: ", result);

            const parsedResult = JSON.parse(result);
            parsedResult.categories = Array.isArray(parsedResult.categories)
                ? parsedResult.categories
                : [parsedResult.categories];
            console.log("Parsed classification result:", parsedResult);

            res.status(200).json(parsedResult);
        } catch (error) {
            console.error("Error classifying image:", error);
            res.status(500).json({
                name: "Unknown",
                description: "Failed to classify image",
                categories: ["Unclassified"],
                estimatedQuantity: "Unknown",
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}