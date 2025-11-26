"use client";

import { useState, useRef } from "react";
import { Upload, X, PenTool, FileText } from "lucide-react";

interface TeacherSignatureUploadProps {
  onSignatureChange: (signatureData: string | null) => void;
  currentSignature?: string | null;
  verificationMethod?: "signature" | "digital" | "email";
  onVerificationMethodChange?: (method: "signature" | "digital" | "email") => void;
  teacherName?: string;
}

export default function TeacherSignatureUpload({
  onSignatureChange,
  currentSignature,
  verificationMethod = "signature",
  onVerificationMethodChange,
  teacherName
}: TeacherSignatureUploadProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(currentSignature || null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(null);
    onSignatureChange(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      setSignatureData(dataURL);
      onSignatureChange(dataURL);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataURL = event.target?.result as string;
        setSignatureData(dataURL);
        onSignatureChange(dataURL);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSignaturePreview = () => {
    if (!signatureData) return null;

    return (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Signature Preview:</p>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <img
            src={signatureData}
            alt="Teacher signature"
            className="max-w-full max-h-32 object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teacher Verification Method *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "signature", label: "Physical Signature", icon: PenTool },
            { value: "digital", label: "Digital Signature", icon: FileText },
            { value: "email", label: "Email Verification", icon: Upload }
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => onVerificationMethodChange?.(method.value as any)}
              className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                verificationMethod === method.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              <method.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{method.label}</div>
            </button>
          ))}
        </div>
      </div>

      {verificationMethod === "signature" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature Capture
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {teacherName ? `${teacherName}'s signature` : "Teacher signature"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`px-3 py-1 text-xs rounded ${
                    isDrawingMode
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isDrawingMode ? "Drawing Mode" : "Enable Drawing"}
                </button>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className={`border border-gray-300 rounded w-full cursor-crosshair ${
                isDrawingMode ? "bg-white" : "bg-gray-50 cursor-not-allowed"
              }`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ touchAction: "none" }}
            />

            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-500">
                {isDrawingMode
                  ? "Click and drag to sign digitally"
                  : "Enable drawing mode to create a digital signature"
                }
              </p>
              {isDrawingMode && (
                <button
                  type="button"
                  onClick={saveSignature}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Save Signature
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {verificationMethod === "digital" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Signature Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="signature-upload"
            />
            <label htmlFor="signature-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click to upload signature image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, or PDF files accepted
              </p>
            </label>
          </div>
        </div>
      )}

      {verificationMethod === "email" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Email Verification</h4>
              <p className="text-sm text-blue-700 mt-1">
                An email will be sent to the teacher for verification. No signature upload required.
              </p>
            </div>
          </div>
        </div>
      )}

      {renderSignaturePreview()}
    </div>
  );
}
