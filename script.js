document.addEventListener('DOMContentLoaded', function () {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const topBanner = document.getElementById('topBanner');

    // IMPORTANT: Placeholder for Gemini API Key.
    // For production, it's highly recommended to manage API keys securely.
    // Options include:
    // 1. Using a backend proxy server that adds the API key to requests away from the client.
    // 2. Using server-side rendering where the API call is made on the server.
    // 3. If client-side calls are unavoidable, use restricted API keys if your provider supports them
    //    (e.g., restrict by HTTP referrer or IP address).
    // Avoid embedding keys directly in client-side JavaScript that will be publicly accessible.
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key

    // It's good practice to specify the model if you know it.
    // Replace with the correct model identifier for Gemini 2.5 Flash if different.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    imageUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                imageUpload.style.display = 'none';
                topBanner.textContent = 'Processing...'; // Indicate processing

                // Send image to Gemini
                getColorsFromGemini(e.target.result, file.type);
            }
            reader.readAsDataURL(file); // This gives a base64 string
        }
    });

    async function getColorsFromGemini(imageDataUrl, imageType) {
        // The Gemini API expects a specific format for inline data (base64 string without the prefix)
        const base64ImageData = imageDataUrl.split(',')[1];

        const requestBody = {
            "contents": [{
                "parts": [
                    { "text": "Tell me the color of the object on the attached picture, respond only with the color name. If you can provide the response in JSON format like {\"color\": \"name\"}, that would be preferred." },
                    {
                        "inline_data": {
                            "mime_type": imageType, // e.g., "image/jpeg" or "image/png"
                            "data": base64ImageData
                        }
                    }
                ]
            }],
            // Optional: Add generationConfig if needed for specific controls
            // "generationConfig": {
            //   "response_mime_type": "application/json" // Request JSON output
            // }
        };

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.error('Gemini API request failed:', response.status, await response.text());
                topBanner.textContent = 'Gemini unavailable';
                return;
            }

            const data = await response.json();
            
            // Based on typical Gemini responses, the text might be in:
            // data.candidates[0].content.parts[0].text
            // Or if you requested JSON and it's honored:
            // data.candidates[0].content.parts[0].json.color (or similar)

            let colorName = 'Could not determine color'; // Default if parsing fails

            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                
                const part = data.candidates[0].content.parts[0];
                if (part.text) {
                    colorName = part.text.trim(); 
                } else if (part.json && part.json.color) { // Hypothetical JSON structure
                    colorName = part.json.color.trim();
                }
                // Basic cleanup, remove potential quotes if Gemini adds them
                colorName = colorName.replace(/^["']|["']$/g, "");
            }
            
            topBanner.textContent = colorName;

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            topBanner.textContent = 'Gemini unavailable';
        }
    }
});
