import React, { useState, useRef } from "react";
import { 
  Upload, 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  FileText
} from "lucide-react";
import { TargetRole, ResumeReport } from "../types";

interface ResumeAnalyzerFormProps {
  onAnalysisSuccess: (report: ResumeReport, originalContent: string, role: string, sourceFilename?: string) => void;
  isGlobalAnalyzing: boolean;
  setIsGlobalAnalyzing: (val: boolean) => void;
}

export default function ResumeAnalyzerForm({ 
  onAnalysisSuccess,
  isGlobalAnalyzing,
  setIsGlobalAnalyzing
}: ResumeAnalyzerFormProps) {
  const [targetRole, setTargetRole] = useState<string>("");
  const [extractedFileName, setExtractedFileName] = useState("");
  const [extractedFileText, setExtractedFileText] = useState("");
  
  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzingHere, setIsAnalyzingHere] = useState(false);
  const isAnalyzing = isAnalyzingHere;
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const isAnalyzingRef = useRef(false);
  
  // Real-time analysis pipeline
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const pipelineSteps = [
    "Reading content",
    "Extracting information",
    "Analyzing skills",
    "Analyzing projects",
    "Checking presentation",
    "Checking role alignment",
    "Generating recommendations",
    "Preparing report"
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload and Text Extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");
    setIsUploading(true);
    setExtractedFileText("");
    setExtractedFileName("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file.");
      }

      setExtractedFileText(data.text);
      setExtractedFileName(data.fileName);
      setSuccessMsg(`Resume "${data.fileName}" successfully parsed! Ready for AI review.`);
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't read this file. Please upload another PDF, DOCX or TXT file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Run AI analysis sequence
  const runAnalysis = async () => {
    if (isAnalyzingRef.current || isAnalyzingHere || isGlobalAnalyzing) {
      if (!isAnalyzingHere && isGlobalAnalyzing) {
        setErrorMsg("Another analysis is currently running in the Portfolio tab. Please wait until it completes.");
      }
      return; // Prevent duplicate concurrent requests!
    }

    if (!extractedFileText) {
      setErrorMsg("Please upload your resume file first.");
      return;
    }

    isAnalyzingRef.current = true;
    setErrorMsg("");
    setIsAnalyzingHere(true);
    setIsGlobalAnalyzing(true);
    setCurrentStepIdx(0);

    // 1. Simulate step changes visually
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < pipelineSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1500);

    try {
      // 2. Trigger Express Endpoint for Resume Review
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: extractedFileText,
          targetRole: targetRole,
        }),
      });

      const report = await response.json();
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(report.error || "AI Resume Review failed.");
      }

      // Finish pipeline step instantly
      setCurrentStepIdx(pipelineSteps.length - 1);
      setTimeout(() => {
        isAnalyzingRef.current = false;
        onAnalysisSuccess(report, extractedFileText, targetRole || "General Tech", extractedFileName || "Uploaded Candidate Resume");
        setIsAnalyzingHere(false);
        setIsGlobalAnalyzing(false);
      }, 800);

    } catch (err: any) {
      clearInterval(stepInterval);
      isAnalyzingRef.current = false;
      setErrorMsg(err.message || "AI analysis is temporarily unavailable. Please try again.");
      setIsAnalyzingHere(false);
      setIsGlobalAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Real-time Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#3d2314]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#faf9f6] border border-[#e8d8c8] max-w-lg w-full rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4f0ea] flex items-center justify-center text-[#8c6239] mx-auto mb-6 animate-spin-slow">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-2xl font-bold text-[#3d2314] mb-1">AI Resume Review</h3>
            <p className="text-sm text-[#705245] mb-8">Scanning ATS parameters, formats, & skills match...</p>

            {/* Steps list */}
            <div className="space-y-3.5 text-left max-w-sm mx-auto mb-8">
              {pipelineSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center space-x-3 transition-all duration-300 ${
                      isCompleted ? "opacity-100 scale-100" : isCurrent ? "opacity-100 scale-102 font-semibold text-[#8c6239]" : "opacity-40"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#8c6239] animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#e8d8c8] flex items-center justify-center text-[10px] text-[#705245] shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="text-sm text-[#3d2314]">{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-[#f4f0ea] h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-[#5c4033] h-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentStepIdx + 1) / pipelineSteps.length) * 100}%` }}
              />
            </div>
            <div className="text-right text-xs text-[#705245] font-semibold">
              Step {currentStepIdx + 1} of {pipelineSteps.length}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#fbfaf8] border border-[#e8d8c8] rounded-2xl shadow-md overflow-hidden p-6 sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-[#f4f0ea] border border-[#e8d8c8] px-3 py-1 rounded-full text-xs font-semibold text-[#5c4033] mb-4">
            <Sparkles className="w-3 h-3 text-[#8c6239]" />
            <span>ATS Diagnostic Suite</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight">AI Resume Analyzer</h2>
          <p className="text-sm text-[#705245] mt-1">Upload your resume to perform strict structural, skills, and readability checks.</p>
        </div>

        {/* Upload Area */}
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-bold text-[#3d2314]">Resume Document File</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#e8d8c8] hover:border-[#8c6239] bg-white rounded-2xl p-10 text-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <FileText className="w-12 h-12 text-[#8c6239]/70 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-base font-bold text-[#3d2314]">
              {extractedFileName ? `Selected Resume: ${extractedFileName}` : "Select Resume (PDF, DOCX, TXT)"}
            </p>
            <p className="text-xs text-[#705245] mt-2">Supports standard resume formats up to 10MB limit</p>
          </div>

          {isUploading && (
            <div className="flex items-center space-x-2 text-sm text-[#8c6239]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting resume text content...</span>
            </div>
          )}

          {extractedFileText && (
            <div className="mt-4 p-4 rounded-xl bg-[#f4f0ea]/50 border border-[#e8d8c8] text-xs text-[#5c4033] max-h-32 overflow-y-auto font-mono">
              <div className="font-bold text-[#3d2314] mb-1 uppercase tracking-wider text-[10px]">Resume Text Scanned Successfully:</div>
              {extractedFileText}
            </div>
          )}
        </div>

        {/* Target Job Role Select */}
        <div className="space-y-2 border-t border-[#e8d8c8] pt-6 mb-8 max-w-md">
          <label className="text-sm font-bold text-[#3d2314] flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4 text-[#8c6239]" />
            <span>Desired Job Role Target</span>
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] focus:outline-none focus:border-[#8c6239] transition-colors"
          >
            <option value="">-- General Technology Target --</option>
            {Object.values(TargetRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications and Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start space-x-2.5 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="w-full">
              <p className="font-semibold">Format Alert</p>
              <p className="mt-0.5">{errorMsg}</p>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={isUploading || isAnalyzingHere || isGlobalAnalyzing}
                className="mt-3 px-4 py-2 bg-[#5c4033] hover:bg-[#3d2314] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Try Again</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-start space-x-2.5 mb-6 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold">Text Successfully Loaded</p>
              <p className="mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* CTA Analyze */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={isUploading || isAnalyzingHere || isGlobalAnalyzing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#5c4033] text-[#faf9f6] font-bold text-base shadow-md hover:bg-[#3d2314] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzingHere || isGlobalAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#d4b996]" />
                <span>Review in Progress...</span>
              </>
            ) : (
              <>
                <span>Start Resume Review</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
