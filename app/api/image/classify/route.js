import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { imageDataUrl } = await request.json();
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image and provide a JSON object with the following structure: 
                                {
                                    "name": "Item name",
                                    "categories": "[Category1, Category2]",
                                    "unit": "unit of the item"
                                    "ingredients": [Ingredient1, Ingredient2],
                                    "culinaryUses": "suggestion on how to use this in cooking"
                                    "storageInstructions": "how to store this item"
                                }
                            Ensure the response is a valid JSON object without any markdown formatting or backticks.`
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
            max_tokens: 300,
        });

        const result = response.choices[0].message.content;
        console.log("Image classification result: ", result);

        const parsedResult = JSON.parse(result);
        parsedResult.categories = Array.isArray(parsedResult.categories)
            ? parsedResult.categories
            : [parsedResult.categories];
        
        return NextResponse.json(parsedResult);
    } catch (error) {
        console.error("Error classifying image:", error);
        return NextResponse.json(
            {
                name: "Unknown",
                description: "Failed to classify image",
                categories: ["Unclassified"],
                estimatedQuantity: "Unknown",
            },
            { status: 500 }
        );
    }
}
