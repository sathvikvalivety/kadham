import React, { useRef, useState, useEffect } from "react";
import { createApiClient } from "../lib/api";

function WasteDepositPage() {
  const [token] = useState(() => {
    const t = localStorage.getItem("kadham_token");
    return t && t !== "null" ? t : null;
  });
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      setError("Could not access camera. Please ensure you have given permission.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL("image/png");
    setCapturedImage(imageData);
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    try {
      if (!token) {
        setError("You must be logged in to make a deposit.");
        setIsAnalyzing(false);
        return;
      }

      // Create deposit with image
      const depositRes = await api.post("/deposits", {
        binId: 1, // Defaulting to bin 1 for now
        description,
        image: capturedImage
      });

      setResult(depositRes.data);
      setCapturedImage(null);
      setDescription("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log out and log in again.");
      } else {
        setError("Failed to submit deposit. Please try again.");
      }
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">New Waste Deposit</h1>
        <p className="text-gray-500 text-sm mt-1">Use your camera to identify the waste</p>
      </div>

      <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border-2 border-gray-100">
        {!isCapturing && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
            <div className="p-4 bg-gray-800 rounded-full bg-opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-primary rounded-full font-semibold hover:bg-opacity-90 transition-all text-white"
            >
              Open Camera
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isCapturing ? 'block' : 'hidden'}`}
        />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Capture"
            className="w-full h-full object-cover"
          />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white font-medium animate-pulse">AI is detecting objects...</p>
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <button
              onClick={captureImage}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-full border-2 border-primary"></div>
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && !isAnalyzing && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Object Snapshot</span>
            <button onClick={retake} className="text-sm text-primary font-semibold hover:underline">Retake Photo</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Details (Optional)</label>
              <textarea
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all outline-none bg-gray-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Added context helps our AI refine detection"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              Process with AI
            </button>
          </form>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-6 text-center shadow-sm animate-bounce-in">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-green-800 font-bold text-lg">Deposit Successful!</h3>
          <p className="text-green-700 text-sm mt-1">
            Deposit ID <span className="font-mono font-bold">#{result.id}</span> record created.
          </p>
          <p className="text-green-600 text-xs mt-2">
            The AI Service is currently analyzing your image. Check your dashboard for the status.
          </p>
        </div>
      )}
    </div>
  );
}

export default WasteDepositPage;
