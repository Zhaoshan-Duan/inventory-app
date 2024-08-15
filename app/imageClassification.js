import openai from './openai-config'

export const classifyImage = async (imageDataUrl) => {
    try {
        const response =
            await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "AWhat is this item? Please provide a brief description and possible categories for inventory management." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageDataUrl,
                                },
                            },
                        ],
                    },
                ],
            })
        const result = response.choices[0].message.content
        return result
    } catch (e) {
        console.error("Error classifying image:", e);
        if (e.response && e.response.status === 429) {
            return JSON.stringify({
                description: "Classification temporarily unavailable due to rate limiting.",
                categories: ["Unclassified"]
            });
        }
        return JSON.stringify({
            description: "Failed to classify image.",
            categories: ["Unclassified"]
        });    }
}
