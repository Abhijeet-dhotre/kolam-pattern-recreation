"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ImageIcon } from "lucide-react"

interface AnalysisResult {
  description: string
  svg: string
}

export default function KolamAnalysis() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }
    setSelectedFile(file)
    setError(null)
    setAnalysisResult(null)
  }

  const analyzePattern = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve(result.split(",")[1])
        }
        reader.readAsDataURL(selectedFile)
      })

      const apiKey = "AIzaSyBJ2tPSLxlbbjtt-DwvNu35PaIC0NkGgaQ"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`

      const systemPrompt =
        "You are an expert in traditional Indian Kolam art. Analyze the provided image of a Kolam pattern. Describe the pattern's structure, type (e.g., Pulli Kolam, Chikku Kolam), and symmetry. Most importantly, generate a simplified, clean, white-on-transparent SVG representation of the core pattern. The SVG should be scalable, have a transparent background, and contain the essential lines and dots in WHITE stroke (stroke='white' or stroke='#ffffff'). Do not use any fill colors except white where needed. Ensure the SVG viewport fits the pattern and all elements are clearly visible in white color. Output your response as a valid JSON object with two keys: 'description' (a string) and 'svg' (a string containing the full SVG code with white strokes)."

      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            parts: [
              { text: "Analyze this Kolam pattern and generate the JSON output." },
              { inlineData: { mimeType: selectedFile.type, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const candidate = result.candidates?.[0]

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const jsonText = candidate.content.parts[0].text
        const parsedJson = JSON.parse(jsonText)
        setAnalysisResult(parsedJson)
      } else {
        throw new Error("Invalid response structure from API.")
      }
    } catch (err) {
      console.error("Error during analysis:", err)
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAll = () => {
    setSelectedFile(null)
    setAnalysisResult(null)
    setError(null)
    // Reset file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-white mb-4 text-balance drop-shadow-lg">
            AI-Powered Kolam Pattern Analyzer
          </h1>
          <p className="text-xl text-amber-100 text-pretty drop-shadow-md">
            Upload a Kolam image to analyze its structure and get a recreated digital version.
          </p>
        </div>

        {/* Upload Card */}
        <Card className="bg-black/30 backdrop-blur-lg border border-white/20 shadow-2xl p-8 mb-8 rounded-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">Upload Your Kolam Image</h2>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed border-white/30 rounded-xl p-12 text-center transition-all cursor-pointer hover:border-amber-300/70 hover:bg-black/40 backdrop-blur-sm ${
              dragActive ? "border-amber-300/70 bg-black/40" : ""
            } ${selectedFile ? "border-green-400/70 bg-green-500/30" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center space-y-4">
              {selectedFile ? (
                <>
                  <ImageIcon className="w-16 h-16 text-green-400" />
                  <div className="text-white">
                    <p className="font-semibold text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-amber-100">Click to change file</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 text-white/60 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-full h-full"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <p className="text-lg">
                      <span className="text-amber-200 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-amber-100 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" className="hidden" onChange={handleFileInput} accept="image/*" id="file-upload" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <div className="mt-8 flex justify-center">
            <Button
              className="bg-amber-600/80 backdrop-blur-sm hover:bg-amber-700/80 text-white px-12 py-3 text-lg font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 shadow-lg"
              onClick={analyzePattern}
              disabled={!selectedFile || isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Pattern...
                </>
              ) : (
                "Analyze Pattern"
              )}
            </Button>
          </div>
        </Card>

        {/* Powered by Gemini */}
        <div className="text-center">
          <p className="text-amber-100/80 text-sm">Powered by the Gemini API</p>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-12 space-y-8">
            {/* Original and Recreated Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image */}
              <Card className="bg-black/30 backdrop-blur-lg border border-white/20 shadow-xl p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4 text-center drop-shadow-md">Original Image</h3>
                <div className="aspect-square bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
                  {selectedFile && (
                    <img
                      src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                      alt="Original Kolam"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </Card>

              {/* AI Recreation */}
              <Card className="bg-black/30 backdrop-blur-lg border border-white/20 shadow-xl p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4 text-center drop-shadow-md">AI Recreation</h3>
                <div className="aspect-square bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center p-4 border border-white/20">
                  <div
                    className="max-w-full max-h-full [&_svg]:w-full [&_svg]:h-full [&_svg_*]:stroke-white [&_svg_*]:fill-white"
                    dangerouslySetInnerHTML={{ __html: analysisResult.svg }}
                  />
                </div>
              </Card>
            </div>

            {/* Analysis Description */}
            <Card className="bg-black/30 backdrop-blur-lg border border-white/20 shadow-xl p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center drop-shadow-md">Pattern Analysis</h3>
              <div className="text-amber-50 text-lg leading-relaxed">
                {analysisResult.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
