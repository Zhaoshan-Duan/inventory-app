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
        return response.choices[0].message.content

    } catch (e) {
        console.error("Error classifying image:", e);
        return null;
    }
}
