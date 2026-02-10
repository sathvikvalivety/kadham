import React, { useState } from "react";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:5001";

function GreenAlternatives() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const handleImageChange = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("Image size must be less than 10MB");
            return;
        }

        setError(null);
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result;
            setImage(base64String);
            setImagePreview(base64String);
        };

        reader.readAsDataURL(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageChange(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleImageChange(file);
    };

    const analyzeImage = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${AI_SERVICE_URL}/analyze-waste-reuse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image })
            });

            if (!response.ok) {
                throw new Error("Analysis failed. Please try again.");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.message || "Failed to analyze image");
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraMode(true);
        } catch (err) {
            console.error("Camera error:", err);
            setError("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraMode(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const base64Image = canvas.toDataURL("image/jpeg");
        setImage(base64Image);
        setImagePreview(base64Image);
        stopCamera();
    };

    const reset = () => {
        setImage(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        stopCamera();
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border border-green-100 shadow-lg">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        🌱 Discover Greener Alternatives
                    </h2>
                    <p className="text-gray-600">
                        Upload an image of any item to get eco-friendly alternatives and creative reuse ideas
                    </p>
                </div>

                {!imagePreview && !cameraMode ? (
                    <div className="space-y-4">
                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive
                                    ? "border-primary bg-teal-50 scale-105"
                                    : "border-gray-300 bg-white/50 backdrop-blur-sm hover:border-primary"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                <div className="text-6xl mb-4">📸</div>
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Drop an image here or click to upload
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supports JPG, PNG, WEBP (max 10MB)
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-gray-500 text-sm mb-3">
                                <div className="h-px bg-gray-300 w-20"></div>
                                <span>OR</span>
                                <div className="h-px bg-gray-300 w-20"></div>
                            </div>
                            <button
                                onClick={startCamera}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                            >
                                📷 Use Camera
                            </button>
                        </div>
                    </div>
                ) : cameraMode ? (
                    <div className="space-y-4">
                        <div className="relative bg-black rounded-2xl overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto rounded-2xl"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={capturePhoto}
                                className="flex-1 bg-primary hover:bg-teal-700 text-white px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                📸 Capture Photo
                            </button>
                            <button
                                onClick={stopCamera}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                            <img
                                src={imagePreview}
                                alt="Uploaded item"
                                className="w-full max-h-96 object-contain rounded-xl"
                            />
                            <button
                                onClick={reset}
                                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                            >
                                ✕ Remove
                            </button>
                        </div>

                        {!result && !loading && (
                            <button
                                onClick={analyzeImage}
                                className="w-full bg-primary hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🔍 Analyze & Get Suggestions
                            </button>
                        )}

                        {loading && (
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-lg">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                                <p className="text-gray-600 font-medium">Analyzing your item...</p>
                                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <p className="text-red-600 font-medium">⚠️ {error}</p>
                                <button
                                    onClick={analyzeImage}
                                    className="mt-4 text-primary hover:underline font-medium"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Classification Results */}
                                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        🧠 Classification
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Item</p>
                                            <p className="text-lg font-bold text-primary capitalize">
                                                {result.item}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Material</p>
                                            <p className="text-lg font-bold text-gray-800">{result.material}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Confidence</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${result.confidence}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">
                                                    {result.confidence}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Eco-Friendly Status */}
                                {result.is_already_eco_friendly && (
                                    <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-6 border border-green-200 shadow-lg">
                                        <p className="text-lg font-bold text-green-800 flex items-center gap-2">
                                            ✅ Great choice! This item is already eco-friendly and reusable.
                                        </p>
                                        <p className="text-sm text-green-700 mt-2">
                                            Keep using it and reduce waste!
                                        </p>
                                    </div>
                                )}

                                {/* Greener Alternatives */}
                                {!result.is_already_eco_friendly && result.alternatives?.length > 0 && (
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            ♻️ Greener Alternatives
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.alternatives.map((alt, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow"
                                                >
                                                    <span className="text-green-600 font-bold text-lg">✓</span>
                                                    <span className="text-gray-800 font-medium">{alt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* DIY Ideas */}
                                {result.diy?.length > 0 && (
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            🛠️ DIY & Reuse Ideas
                                        </h3>
                                        <div className="space-y-3">
                                            {result.diy.map((idea, idx) => {
                                                const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                                    idea.youtube_search
                                                )}`;
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={youtubeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                                                    >
                                                        <span className="text-2xl">📺</span>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                                                                {idea.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Click to search on YouTube
                                                            </p>
                                                        </div>
                                                        <span className="text-gray-400 group-hover:text-primary transition-colors">
                                                            →
                                                        </span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={reset}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                                >
                                    🔄 Analyze Another Item
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GreenAlternatives;
