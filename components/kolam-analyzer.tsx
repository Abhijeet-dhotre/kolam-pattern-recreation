<!DOCTYPE
html >
  <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Kolam Pattern Analyzer & Recreator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
\
            font-family: 'Inter', sans-serif;
        }
        .loader {
\
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
\
            0% { transform: rotate(0deg); }
\
            100% { transform: rotate(360deg); }
        }
        .upload-container {
\
            border: 2px dashed #cbd5e1;
            transition: border-color 0.3s ease;
        }
        .upload-container:hover {
\
            border-color: #3b82f6;
        }
        #recreated-svg-container svg {
\
             width: 100%;
             height: auto;
             max-width: 400px;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800">

    <div class="container mx-auto p-4 md:p-8">
        <header class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900">AI-Powered Kolam Pattern Analyzer</h1>
            <p class="mt-2 text-md text-slate-600">Upload a Kolam image to analyze its structure and get a recreated digital version.</p>
        </header>

        <main class="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
\
            <!-- Step 1: Image Upload -->
            <div id="upload-step">
                <h2 class="text-xl font-semibold mb-4 text-center">Upload Your Kolam Image</h2>
                <div id="upload-container" class="upload-container p-10 text-center rounded-xl cursor-pointer">
                    <input type="file" id="image-uploader" class="hidden" accept="image/*">
                    <div id="upload-prompt">
                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p class="mt-2 text-sm text-slate-600">
                            <span class="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p class="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
                <div class="text-center mt-4">
                     <button id="analyze-button" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed" disabled>
                        Analyze Pattern
                    </button>
                </div>
            </div>

\
            <!-- Analysis & Result Section -->
            <div id="result-section" class="hidden mt-8">
                <div class="grid md:grid-cols-2 gap-8 items-start">
\
                    <!-- Original Image -->
                    <div class="text-center">
                        <h3 class="text-lg font-semibold mb-3">Original Image</h3>
                        <div class="w-full h-auto p-2 border rounded-lg shadow-sm bg-slate-50">
                           <img id="original-image-preview" src="#" alt="Original Kolam Image" class="rounded-md max-w-full h-auto mx-auto">
                        </div>
                    </div>
\
                    <!-- Loader -->
                    <div id="loader-container" class="text-center flex flex-col items-center justify-center h-full hidden">
                         <div class="loader"></div>
                         <p class="mt-4 text-slate-600">AI is analyzing your Kolam... Please wait.</p>
                    </div>

\
                    <!-- Recreated Pattern -->
                    <div id="recreated-pattern-container" class="text-center hidden">
                        <h3 class="text-lg font-semibold mb-3">AI Recreated Pattern (SVG)</h3>
                        <div id="recreated-svg-container" class="w-full h-auto p-4 border rounded-lg shadow-sm bg-slate-50 flex items-center justify-center">
\
                            <!-- SVG will be injected here -->
                        </div>
                    </div>
                </div>

\
                <!-- Analysis Description -->
                 <div id="analysis-description-container" class="mt-8 hidden">
                    <h3 class="text-lg font-semibold mb-3 text-center">AI Analysis</h3>
                    <div id="analysis-description" class="bg-slate-100 p-4 rounded-lg text-slate-700 prose max-w-none">
\
                       <!-- Description will be injected here -->
                    </div>
                </div>
                 <div class="text-center mt-8">
                    <button id="reset-button" class="bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
                        Analyze Another
                    </button>
                </div>
            </div>
        </main>

        <footer class="text-center mt-8 text-sm text-slate-500">
            <p>Powered by the Gemini API</p>
        </footer>
    </div>

    <script>
        const imageUploader = document.getElementById('image-uploader');
        const uploadContainer = document.getElementById('upload-container');
        const uploadPrompt = document.getElementById('upload-prompt');
        const analyzeButton = document.getElementById('analyze-button');
        const originalImagePreview = document.getElementById('original-image-preview');
        
        const uploadStep = document.getElementById('upload-step');
        const resultSection = document.getElementById('result-section');
        const loaderContainer = document.getElementById('loader-container');
        const recreatedPatternContainer = document.getElementById('recreated-pattern-container');
        const recreatedSvgContainer = document.getElementById('recreated-svg-container');
        const analysisDescriptionContainer = document.getElementById('analysis-description-container');
        const analysisDescription = document.getElementById('analysis-description');
        const resetButton = document.getElementById('reset-button');
        
        let file = null;
        let base64Image = null;

        // --- Event Listeners ---

        uploadContainer.addEventListener('click', () => imageUploader.click());
        
        uploadContainer.addEventListener('dragover', (e) => {
\
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.add('border-blue-500', 'bg-blue-50');
        });

        uploadContainer.addEventListener('dragleave', (e) => {
\
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.remove('border-blue-500', 'bg-blue-50');
        });

        uploadContainer.addEventListener('drop', (e) => {
\
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.remove('border-blue-500', 'bg-blue-50');
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
\
                handleFile(droppedFiles[0]);
            }
        });

        imageUploader.addEventListener('change', (e) => {
\
            if (e.target.files && e.target.files[0]) {
\
                handleFile(e.target.files[0]);
            }
        });
        
        analyzeButton.addEventListener('click', handleAnalysis);
        resetButton.addEventListener('click', resetUI);

        // --- Core Functions ---

        function handleFile(inputFile) {
\
            if (!inputFile.type.startsWith('image/')) {
\
                alert('Please upload an image file.\');
                return;
            }
            file = inputFile;
            const reader = new FileReader();
            reader.onload = function(e) {
\
                originalImagePreview.src = e.target.result;
                base64Image = e.target.result.split(',')[1];
                
                // Update UI to show filename
                uploadPrompt.innerHTML = `<p class="font-medium text-slate-700">${file.name}</p>`;
                
                analyzeButton.disabled = false;
            }
            reader.readAsDataURL(file);
        }

        async function handleAnalysis() {
\
            if (!base64Image) {
\
                alert('Please upload an image first.\');
                return;
            }

            // Transition UI
            uploadStep.classList.add('hidden');
            resultSection.classList.remove('hidden');
            loaderContainer.classList.remove('hidden');
            recreatedPatternContainer.classList.add('hidden');
            analysisDescriptionContainer.classList.add('hidden');

            const apiKey = "AIzaSyB1de-Mob_1CyNCg0c_v5PIBKUt7IqlCT8"; // API Key is not needed for this model
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const systemPrompt = "You are an expert in traditional Indian Kolam art. Analyze the provided image of a Kolam pattern. Describe the pattern's structure, type (e.g., Pulli Kolam, Chikku Kolam), and symmetry. Most importantly, generate a simplified, clean, black-and-white SVG representation of the core pattern. The SVG should be scalable, have a transparent background, and only contain the essential lines and dots in black stroke. Do not use any fill colors. Ensure the SVG viewport fits the pattern. Output your response as a valid JSON object with two keys: 'description' (a string) and 'svg' (a string containing the full SVG code).";

            const payload = {
\
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{
\
                    parts: [
                        { text: "Analyze this Kolam pattern and generate the JSON output." },
                        { inlineData: { mimeType: file.type, data: base64Image } }
                    ]
                }],
                generationConfig: {
                  responseMimeType: "application/json",
                }
            };
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                const candidate = result.candidates?.[0];

                if (candidate && candidate.content?.parts?.[0]?.text) {
                   const jsonText = candidate.content.parts[0].text;
                   const parsedJson = JSON.parse(jsonText);
                   displayResults(parsedJson);
                } else {
                    throw new Error("Invalid response structure from API.");
                }

            } catch (error) {
                console.error("Error during analysis:", error);
                displayError(error.message);
            } finally {
                loaderContainer.classList.add('hidden');
            }
        }

        function displayResults(data) {
            if (data.description) {
                analysisDescription.innerHTML = `<p>${data.description.replace(/\n/g, '</p><p>')}</p>`;
                analysisDescriptionContainer.classList.remove('hidden');
            }
            if (data.svg) {
                recreatedSvgContainer.innerHTML = data.svg;
                recreatedPatternContainer.classList.remove('hidden');
            }
        }

        function displayError(errorMessage) {
            recreatedPatternContainer.classList.remove('hidden');
            recreatedSvgContainer.innerHTML = `<p class="text-red-500">Sorry, an error occurred: ${errorMessage}</p>`;
        }
        
        function resetUI() {
            file = null;
            base64Image = null;
            
            imageUploader.value = ''; // Reset file input
            originalImagePreview.src = '#';
            analyzeButton.disabled = true;

            uploadPrompt.innerHTML = `
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="mt-2 text-sm text-slate-600">
                    <span class="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
            `;

            uploadStep.classList.remove('hidden');
            resultSection.classList.add('hidden');
            loaderContainer.classList.add('hidden');
            recreatedSvgContainer.innerHTML = '';
            analysisDescription.innerHTML = '';
        }
    </script>
</body>
</html>
