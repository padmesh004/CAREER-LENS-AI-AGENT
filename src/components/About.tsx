import React from "react";
import { Compass, Sparkles, Award, Globe, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <section className="bg-[#faf9f6] py-20 border-t border-[#e8d8c8]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual Presentation Card */}
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#f4f0ea] rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#f5eedc] rounded-full blur-3xl opacity-50" />
            
            <div className="relative bg-[#fbfaf8] border border-[#e8d8c8] p-10 rounded-2xl shadow-lg text-center transform hover:rotate-1 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-[#5c4033] flex items-center justify-center text-[#faf9f6] mx-auto mb-6 shadow-md">
                <Compass className="w-8 h-8 text-[#f5eedc]" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#3d2314] mb-2">CareerLens AI</h3>
              <p className="text-[#8c6239] font-semibold text-sm uppercase tracking-wider mb-4">Precision Diagnostics</p>
              
              <p className="text-sm text-[#705245] leading-relaxed mb-6 max-w-sm mx-auto">
                "Our mission is to democratize high-level recruitment coaching using advanced generative models to deliver objective, fact-based professional feedback."
              </p>

              <div className="border-t border-[#e8d8c8] pt-6 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xl font-black text-[#5c4033]">100%</p>
                  <p className="text-[10px] text-[#705245] font-medium uppercase">Secure</p>
                </div>
                <div>
                  <p className="text-xl font-black text-[#5c4033]">2</p>
                  <p className="text-[10px] text-[#705245] font-medium uppercase">Core Tools</p>
                </div>
                <div>
                  <p className="text-xl font-black text-[#5c4033]">0</p>
                  <p className="text-[10px] text-[#705245] font-medium uppercase">Logins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-1.5 bg-[#f4f0ea] border border-[#e8d8c8] px-3 py-1 rounded-full text-xs font-semibold text-[#5c4033]">
              <Sparkles className="w-3 h-3 text-[#8c6239]" />
              <span>About Us</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight">
              An Elegant, Trust-First Career Advisor
            </h2>
            
            <p className="text-lg text-[#705245] leading-relaxed">
              CareerLens AI is built as a highly robust, full-stack review tool. We skip the login gates, persistent profiling, tracking pixels, and credit cards. We focus entirely on delivering outstanding, mathematically sound feedback for your professional portfolios and resume files.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#f4f0ea] flex items-center justify-center text-[#8c6239] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#3d2314]">Constructive Realism</h4>
                  <p className="text-sm text-[#705245] mt-0.5">
                    We steer clear of automatic 100/100 accolades. Our engine uses advanced system instructions to look for gaps, missing structural details, formatting issues, and provides objective improvement plans.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#f4f0ea] flex items-center justify-center text-[#8c6239] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#3d2314]">Fact-Grounded Feedback</h4>
                  <p className="text-sm text-[#705245] mt-0.5">
                    We strictly forbid our models from fabricating achievements, company experiences, certifications, or statistics. If a credential cannot be verified in the input source, our reviews flag it cleanly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#f4f0ea] flex items-center justify-center text-[#8c6239] shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#3d2314]">Robust Network Reliability</h4>
                  <p className="text-sm text-[#705245] mt-0.5">
                    Equipped with automatic exponential backoff retries and secondary model fallback pipelines, our architecture is built to withstand high loads and API service flickers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
