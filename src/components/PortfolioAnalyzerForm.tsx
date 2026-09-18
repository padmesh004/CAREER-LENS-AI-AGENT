import React, { useState, useRef } from "react";
import { 
  Globe, 
  Upload, 
  Clipboard, 
  Github, 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { TargetRole, PortfolioReport } from "../types";

interface PortfolioAnalyzerFormProps {
  onAnalysisSuccess: (report: PortfolioReport, originalContent: string, role: string, sourceUrl?: string) => void;
  isGlobalAnalyzing: boolean;
  setIsGlobalAnalyzing: (val: boolean) => void;
}

export default function PortfolioAnalyzerForm({ 
  onAnalysisSuccess,
  isGlobalAnalyzing,
  setIsGlobalAnalyzing
}: PortfolioAnalyzerFormProps) {
  const [activeInputTab, setActiveInputTab] = useState<"url" | "file" | "paste">("url");
  const [url, setUrl] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [extractedFileName, setExtractedFileName] = useState("");
  const [extractedFileText, setExtractedFileText] = useState("");
  
  const [githubUrl, setGithubUrl] = useState("");
  const [targetRole, setTargetRole] = useState<string>("");
  
  // Status states
  const [isScraping, setIsScraping] = useState(false);
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

  // Scrape Portfolio website
  const handleScrapeUrl = async () => {
    if (!url) {
      setErrorMsg("Please enter a portfolio website URL first.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsScraping(true);
    setScrapedText("");

    try {
      const response = await fetch("/api/scrape-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to access website.");
      }

      setScrapedText(data.text);
      setSuccessMsg("Website contents successfully fetched and parsed! Ready for AI analysis.");
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't access this website. Please upload your portfolio or paste the content instead.");
    } finally {
      setIsScraping(false);
    }
  };

  // Upload file text extraction
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
      setSuccessMsg(`File "${data.fileName}" successfully read and parsed! Ready for AI analysis.`);
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't read this file. Please upload another PDF, DOCX or TXT file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Run the sequence of 8 real-time processing steps
  const runPipelineAndAnalyze = async () => {
    if (isAnalyzingRef.current || isAnalyzingHere || isGlobalAnalyzing) {
      if (!isAnalyzingHere && isGlobalAnalyzing) {
        setErrorMsg("Another analysis is currently running in the Resume tab. Please wait until it completes.");
      }
      return; // Prevent duplicate concurrent requests!
    }

    // Determine active content
    let contentToAnalyze = "";
    if (activeInputTab === "url") {
      if (!scrapedText) {
        setErrorMsg("Please verify/fetch your website URL contents first before starting the analysis.");
        return;
      }
      contentToAnalyze = scrapedText;
    } else if (activeInputTab === "file") {
      if (!extractedFileText) {
        setErrorMsg("Please upload a portfolio file first.");
        return;
      }
      contentToAnalyze = extractedFileText;
    } else {
      if (!pastedText || pastedText.trim().length < 20) {
        setErrorMsg("Please paste your portfolio text content first (minimum 20 characters).");
        return;
      }
      contentToAnalyze = pastedText;
    }

    isAnalyzingRef.current = true;
    setErrorMsg("");
    setIsAnalyzingHere(true);
    setIsGlobalAnalyzing(true);
    setCurrentStepIdx(0);

    // 1. Simulate real processing steps visual transitions
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
      // 2. Trigger Express Endpoint for Gemini portfolio review
      const response = await fetch("/api/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToAnalyze,
          githubUrl: githubUrl,
          targetRole: targetRole,
        }),
      });

      const report = await response.json();
      
      // Stop simulated interval if finished quickly
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(report.error || "AI analysis failed.");
      }

      // Fill steps instantly to 100% before transitioning
      setCurrentStepIdx(pipelineSteps.length - 1);
      const sourceDisplay = activeInputTab === "url" 
        ? url 
        : activeInputTab === "file" 
          ? (extractedFileName || "Uploaded Portfolio Document") 
          : "Pasted Portfolio Text";
      setTimeout(() => {
        isAnalyzingRef.current = false;
        onAnalysisSuccess(report, contentToAnalyze, targetRole || "General Tech", sourceDisplay);
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

            <h3 className="text-2xl font-bold text-[#3d2314] mb-1">AI Portfolio Audit</h3>
            <p className="text-sm text-[#705245] mb-8">Analyzing alignment, code patterns, & design depth...</p>

            {/* Steps list with visual updates */}
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
            <span>Premium Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight">AI Portfolio Analyzer</h2>
          <p className="text-sm text-[#705245] mt-1">Submit your website, files, or copy content to trigger a comprehensive tech review.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#e8d8c8] mb-6">
          <button
            onClick={() => setActiveInputTab("url")}
            className={`flex items-center space-x-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeInputTab === "url"
                ? "border-[#5c4033] text-[#3d2314] font-bold"
                : "border-transparent text-[#705245] hover:text-[#3d2314]"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website URL</span>
          </button>
          <button
            onClick={() => setActiveInputTab("file")}
            className={`flex items-center space-x-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeInputTab === "file"
                ? "border-[#5c4033] text-[#3d2314] font-bold"
                : "border-transparent text-[#705245] hover:text-[#3d2314]"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Portfolio</span>
          </button>
          <button
            onClick={() => setActiveInputTab("paste")}
            className={`flex items-center space-x-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeInputTab === "paste"
                ? "border-[#5c4033] text-[#3d2314] font-bold"
                : "border-transparent text-[#705245] hover:text-[#3d2314]"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste Content</span>
          </button>
        </div>

        {/* Dynamic Fields */}
        <div className="mb-6">
          {activeInputTab === "url" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#3d2314]">Portfolio Website URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#705245]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] placeholder-[#a08a75]/70 focus:outline-none focus:border-[#8c6239] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  disabled={isScraping || !url}
                  onClick={handleScrapeUrl}
                  className="sm:w-auto px-6 py-2.5 rounded-xl bg-[#f4f0ea] border border-[#e8d8c8] hover:bg-[#e8d8c8]/50 text-[#5c4033] font-semibold text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reading...</span>
                    </>
                  ) : (
                    <span>Fetch Content</span>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#705245]">We will crawl public textual headers, projects, and bio info securely.</p>
              
              {scrapedText && (
                <div className="mt-4 p-4 rounded-xl bg-[#f4f0ea]/50 border border-[#e8d8c8] text-xs text-[#5c4033] max-h-32 overflow-y-auto font-mono">
                  <div className="font-bold text-[#3d2314] mb-1 uppercase tracking-wider text-[10px]">Extracted Text Preview:</div>
                  {scrapedText}
                </div>
              )}
            </div>
          )}

          {activeInputTab === "file" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#3d2314]">Upload Portfolio Document</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#e8d8c8] hover:border-[#8c6239] bg-white rounded-2xl p-8 text-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-[#8c6239]/70 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-[#3d2314]">
                  {extractedFileName ? `File selected: ${extractedFileName}` : "Drag and drop or click to select a file"}
                </p>
                <p className="text-xs text-[#705245] mt-1.5">Supports PDF, DOCX or TXT up to 10MB</p>
              </div>

              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-[#8c6239]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing and extracting text...</span>
                </div>
              )}

              {extractedFileText && (
                <div className="mt-4 p-4 rounded-xl bg-[#f4f0ea]/50 border border-[#e8d8c8] text-xs text-[#5c4033] max-h-32 overflow-y-auto font-mono">
                  <div className="font-bold text-[#3d2314] mb-1 uppercase tracking-wider text-[10px]">Extracted Text Preview:</div>
                  {extractedFileText}
                </div>
              )}
            </div>
          )}

          {activeInputTab === "paste" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#3d2314]">Paste Portfolio Content</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste project descriptions, skills matrix, experience summaries, or website markdown here..."
                rows={6}
                className="w-full p-4 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] placeholder-[#a08a75]/70 focus:outline-none focus:border-[#8c6239] transition-colors"
              />
              <div className="text-right text-xs text-[#705245]">
                {pastedText.length} characters (minimum 20 characters recommended)
              </div>
            </div>
          )}
        </div>

        {/* Optional Context Inputs */}
        <div className="grid sm:grid-cols-2 gap-6 border-t border-[#e8d8c8] pt-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#3d2314] flex items-center space-x-1.5">
              <Github className="w-4 h-4 text-[#8c6239]" />
              <span>Optional GitHub URL</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
              className="w-full px-4 py-2 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] placeholder-[#a08a75]/70 focus:outline-none focus:border-[#8c6239] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#3d2314] flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4 text-[#8c6239]" />
              <span>Target Job Role</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] focus:outline-none focus:border-[#8c6239] transition-colors"
            >
              <option value="">-- General Technology Target --</option>
              {Object.values(TargetRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start space-x-2.5 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="w-full">
              <p className="font-semibold">Verification Alert</p>
              <p className="mt-0.5">{errorMsg}</p>
              <button
                type="button"
                onClick={runPipelineAndAnalyze}
                disabled={isScraping || isUploading || isAnalyzingHere || isGlobalAnalyzing}
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
              <p className="font-semibold">Content Extracted</p>
              <p className="mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={runPipelineAndAnalyze}
            disabled={isScraping || isUploading || isAnalyzingHere || isGlobalAnalyzing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#5c4033] text-[#faf9f6] font-bold text-base shadow-md hover:bg-[#3d2314] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzingHere || isGlobalAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#d4b996]" />
                <span>Analysis in Progress...</span>
              </>
            ) : (
              <>
                <span>Start Portfolio Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
