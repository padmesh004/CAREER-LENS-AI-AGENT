import React from "react";
import { Sparkles, ArrowRight, Layout, FileText, CheckCircle2 } from "lucide-react";

interface HeroProps {
  onSelectPortfolio: () => void;
  onSelectResume: () => void;
  onSelectHowItWorks: () => void;
}

export default function Hero({ onSelectPortfolio, onSelectResume, onSelectHowItWorks }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#faf9f6] pt-12 pb-24 md:py-32">
      {/* Dynamic Background Elements / Soft 3D Objects */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-[#f4f0ea] blur-3xl opacity-70 pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/5 right-1/10 w-80 h-80 rounded-full bg-[#f5eedc] blur-3xl opacity-50 pointer-events-none animate-pulse duration-7000" />

      {/* Floating 3D CSS Particle Elements */}
      <div className="absolute top-20 right-1/4 w-4 h-4 rounded-full bg-[#8c6239] opacity-20 pointer-events-none animate-bounce motion-reduce:animate-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-40 left-1/3 w-6 h-6 rounded-lg bg-[#d2b48c] opacity-20 pointer-events-none animate-spin motion-reduce:animate-none" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/2 right-12 w-3 h-3 rounded-full bg-[#5c4033] opacity-30 pointer-events-none animate-ping motion-reduce:animate-none" style={{ animationDuration: '3s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline */}
          <div className="inline-flex items-center space-x-1.5 bg-[#f4f0ea] border border-[#e8d8c8] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#5c4033] mb-6 shadow-sm select-none animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-[#8c6239] animate-spin-slow" />
            <span>Futuristic Career Diagnostics</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#3d2314] tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
            Build a Portfolio <br />
            <span className="text-[#8c6239] bg-gradient-to-r from-[#5c4033] to-[#a07148] bg-clip-text text-transparent">That Gets Noticed.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#705245] leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
            AI-powered portfolio and resume analysis to help you present your skills, projects and experience more effectively.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20 animate-fade-in-up delay-200">
            <button
              onClick={onSelectPortfolio}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#5c4033] text-[#faf9f6] font-semibold text-base shadow-md hover:bg-[#3d2314] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Review Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSelectHowItWorks}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-[#e8d8c8] text-[#5c4033] hover:bg-[#f4f0ea] font-semibold text-base transition-all duration-200"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Large Dual Analyzer Cards (Separate) */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-2">
          {/* Card 1: Portfolio Analyzer */}
          <div 
            onClick={onSelectPortfolio}
            className="group cursor-pointer bg-[#fbfaf8] border border-[#e8d8c8]/80 hover:border-[#8c6239] rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden"
            style={{ perspective: "1000px" }}
          >
            {/* Background 3D Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f4f0ea] rounded-full group-hover:scale-125 transition-transform duration-500 opacity-70" />
            
            <div className="relative z-10">
              {/* Icon Container with CSS 3D Effect */}
              <div className="w-14 h-14 rounded-2xl bg-[#f4f0ea] flex items-center justify-center text-[#5c4033] mb-6 border border-[#e8d8c8] group-hover:rotate-6 transition-transform duration-300 shadow-sm">
                <Layout className="w-7 h-7 text-[#8c6239]" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#3d2314] mb-3 group-hover:text-[#8c6239] transition-colors">
                AI Portfolio Analyzer
              </h3>
              
              <p className="text-[#705245] text-base leading-relaxed mb-6">
                Analyze your portfolio and discover what you can improve. Submit your website URL, paste content, or upload artifacts to audit target-role alignment, UX, and recruiter readiness.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#e8d8c8]/50 flex items-center justify-between text-[#5c4033] font-bold group-hover:text-[#3d2314]">
              <span>Analyze Portfolio</span>
              <div className="w-8 h-8 rounded-full bg-[#f4f0ea] group-hover:bg-[#5c4033] group-hover:text-[#faf9f6] flex items-center justify-center transition-colors duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Resume Analyzer */}
          <div 
            onClick={onSelectResume}
            className="group cursor-pointer bg-[#fbfaf8] border border-[#e8d8c8]/80 hover:border-[#8c6239] rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden"
            style={{ perspective: "1000px" }}
          >
            {/* Background 3D Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f4f0ea] rounded-full group-hover:scale-125 transition-transform duration-500 opacity-70" />
            
            <div className="relative z-10">
              {/* Icon Container with CSS 3D Effect */}
              <div className="w-14 h-14 rounded-2xl bg-[#f4f0ea] flex items-center justify-center text-[#5c4033] mb-6 border border-[#e8d8c8] group-hover:-rotate-6 transition-transform duration-300 shadow-sm">
                <FileText className="w-7 h-7 text-[#8c6239]" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#3d2314] mb-3 group-hover:text-[#8c6239] transition-colors">
                AI Resume Analyzer
              </h3>
              
              <p className="text-[#705245] text-base leading-relaxed mb-6">
                Upload your resume and get detailed feedback. Verify structural clarity, tech skills match, keyword optimization, and ATS compatibility parameters automatically.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#e8d8c8]/50 flex items-center justify-between text-[#5c4033] font-bold group-hover:text-[#3d2314]">
              <span>Analyze Resume</span>
              <div className="w-8 h-8 rounded-full bg-[#f4f0ea] group-hover:bg-[#5c4033] group-hover:text-[#faf9f6] flex items-center justify-center transition-colors duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Banner */}
        <div className="mt-20 pt-10 border-t border-[#e8d8c8]/50 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-[#8c6239] mb-2" />
            <span className="text-sm font-semibold text-[#3d2314]">No Accounts Needed</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-[#8c6239] mb-2" />
            <span className="text-sm font-semibold text-[#3d2314]">Real-time Scraping</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-[#8c6239] mb-2" />
            <span className="text-sm font-semibold text-[#3d2314]">Advanced ATS Audit</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-[#8c6239] mb-2" />
            <span className="text-sm font-semibold text-[#3d2314]">Live AI Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
