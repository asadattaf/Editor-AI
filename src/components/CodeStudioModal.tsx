/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Code, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Send, 
  Layers, 
  Terminal, 
  Cpu, 
  CheckCircle2,
  FileCode,
  Zap,
  Play
} from 'lucide-react';
import { ProgrammingLanguage } from '../types';

interface CodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (codeMessage: string) => void;
  currentLanguage: 'ar' | 'en';
}

const LANGUAGES_LIST: ProgrammingLanguage[] = [
  { id: 'python', name: 'Python', extension: '.py', category: 'Backend & AI', defaultSnippet: '# Python 3.12 Script\ndef process_data(data: list) -> dict:\n    return {"count": len(data), "status": "success"}\n\nif __name__ == "__main__":\n    print(process_data([1, 2, 3]))' },
  { id: 'javascript', name: 'JavaScript (ES6+)', extension: '.js', category: 'Web & Fullstack', defaultSnippet: '// Modern JavaScript\nexport const fetchInteraction = async (payload) => {\n  const response = await fetch("/api/chat", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n};' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts', category: 'Web & Fullstack', defaultSnippet: 'interface InteractionResponse<T> {\n  id: string;\n  status: "success" | "error";\n  data: T;\n}\n\nexport function handleApiResponse<T>(res: InteractionResponse<T>): T {\n  return res.data;\n}' },
  { id: 'cpp', name: 'C++', extension: '.cpp', category: 'Systems & Performance', defaultSnippet: '#include <iostream>\n#include <vector>\n#include <string>\n\nint main() {\n    std::vector<std::string> features = {"Interactions API", "Universal Sentence Encoder", "EDITOR Engine"};\n    for(const auto& f : features) {\n        std::cout << "Feature: " << f << std::endl;\n    }\n    return 0;\n}' },
  { id: 'csharp', name: 'C# (.NET)', extension: '.cs', category: 'Enterprise & Game', defaultSnippet: 'using System;\nusing System.Threading.Tasks;\n\nnamespace EDITORStudio {\n    public class Program {\n        public static async Task Main(string[] args) {\n            Console.WriteLine("EDITOR C# Engine Running...");\n        }\n    }\n}' },
  { id: 'java', name: 'Java', extension: '.java', category: 'Enterprise & Android', defaultSnippet: 'package com.editor.engine;\n\npublic class AppService {\n    public static void main(String[] args) {\n        System.out.println("EDITOR Java Service Initialized.");\n    }\n}' },
  { id: 'kotlin', name: 'Kotlin (Android)', extension: '.kt', category: 'Mobile & Android', defaultSnippet: 'package com.editor.android\n\ndata class InteractionState(val id: String, val isReady: Boolean)\n\nfun main() {\n    val state = InteractionState("int_101", true)\n    println("State: $state")\n}' },
  { id: 'swift', name: 'Swift (iOS/macOS)', extension: '.swift', category: 'Apple Ecosystem', defaultSnippet: 'import Foundation\n\nstruct EDITORModel: Codable {\n    let name: String\n    let version: Double\n}\n\nlet editor = EDITORModel(name: "EDITOR interactions", version: 1.0)\nprint("Initialized \\(editor.name)")' },
  { id: 'rust', name: 'Rust', extension: '.rs', category: 'Systems & Security', defaultSnippet: 'fn main() {\n    let engine_name = "EDITOR Google Interactions";\n    println!("Rust Engine Core initialized for: {}", engine_name);\n}' },
  { id: 'go', name: 'Go (Golang)', extension: '.go', category: 'Cloud & Microservices', defaultSnippet: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("EDITOR High-Performance Go Microservice")\n}' },
  { id: 'dart', name: 'Dart / Flutter', extension: '.dart', category: 'Cross-Platform Mobile', defaultSnippet: 'import "package:flutter/material.dart";\n\nvoid main() => runApp(const MaterialApp(home: Scaffold(body: Center(child: Text("EDITOR Flutter App")))));' },
  { id: 'php', name: 'PHP 8+', extension: '.php', category: 'Web Backend', defaultSnippet: '<?php\ndeclare(strict_types=1);\n\nclass EDITORService {\n    public function __construct(private string $apiKey) {}\n    public function status(): array {\n        return ["status" => "active", "engine" => "EDITOR"];\n    }\n}' },
  { id: 'ruby', name: 'Ruby', extension: '.rb', category: 'Web & Scripts', defaultSnippet: 'class EDITORApp\n  def initialize(name)\n    @name = name\n  end\n  def greet\n    "Welcome to #{@name}!"\n  end\nend\nputs EDITORApp.new("EDITOR").greet' },
  { id: 'sql', name: 'SQL (PostgreSQL/MySQL)', extension: '.sql', category: 'Databases', defaultSnippet: 'CREATE TABLE IF NOT EXISTS interactions (\n    id VARCHAR(64) PRIMARY KEY,\n    user_prompt TEXT NOT NULL,\n    model_response TEXT NOT NULL,\n    tokens_used INT DEFAULT 0,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);' },
  { id: 'html', name: 'HTML5 & Tailwind CSS', extension: '.html', category: 'Frontend UI', defaultSnippet: '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="UTF-8">\n  <script src="https://cdn.tailwindcss.com"></script>\n  <title>EDITOR UI</title>\n</head>\n<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen">\n  <h1 class="text-3xl font-bold text-blue-400">واجهة برمجية مصممة بواسطة EDITOR</h1>\n</body>\n</html>' },
  { id: 'bash', name: 'Bash / Shell Script', extension: '.sh', category: 'DevOps & Automation', defaultSnippet: '#!/usr/bin/env bash\nset -euo pipefail\n\necho "==> Building EDITOR Project with Google Interactions API..."\nnpm install\nnpm run build\necho "==> Build Completed Successfully!"' },
  { id: 'solidity', name: 'Solidity (Smart Contracts)', extension: '.sol', category: 'Blockchain & Web3', defaultSnippet: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract EDITORVerification {\n    address public owner;\n    event Verified(string interactionId, uint256 timestamp);\n    constructor() { owner = msg.sender; }\n}' },
];

export const CodeStudioModal: React.FC<CodeStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage>(LANGUAGES_LIST[0]);
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('');
  const [generatedCode, setGeneratedCode] = useState(LANGUAGES_LIST[0].defaultSnippet);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputError, setInputError] = useState('');

  const isAr = currentLanguage === 'ar';

  const handleSelectLanguage = (lang: ProgrammingLanguage) => {
    setSelectedLang(lang);
    if (!description) {
      setGeneratedCode(lang.defaultSnippet);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setInputError(isAr ? 'يرجى كتابة وصف للكود المطلوب تصميمه.' : 'Please describe the code you want to generate.');
      return;
    }
    setInputError('');

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang.name,
          description,
          framework,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.code) {
          setGeneratedCode(data.code);
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Code generate note:', e);
    }

    // Fallback template generator
    const fallbackTemplate = `// ==============================================\n// 🚀 ${selectedLang.name.toUpperCase()} Architecture\n// Task: ${description}\n// Framework: ${framework || 'Standard Native'}\n// Engine: EDITOR Code Studio (Google Interactions API)\n// ==============================================\n\n${selectedLang.defaultSnippet}\n\n// TODO: ${description}\n// Implementation generated by EDITOR Code Studio.`;
    setGeneratedCode(fallbackTemplate);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `editor_code_${selectedLang.id}_${Date.now()}${selectedLang.extension}`;
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToChatAction = () => {
    const promptMessage = isAr
      ? `💻 كود مصمم بلغة ${selectedLang.name}:\n\`\`\`${selectedLang.id}\n${generatedCode}\n\`\`\`\n\nطلب التصميم: ${description || 'كود قياسي'}`
      : `💻 Designed Code in ${selectedLang.name}:\n\`\`\`${selectedLang.id}\n${generatedCode}\n\`\`\`\n\nPrompt: ${description || 'Standard code'}`;
    onSendToChat(promptMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] max-h-[860px] bg-[#0d1627] border border-[#2d4164] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#08101d] border-b border-[#243650] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl nickel-btn-3d flex items-center justify-center">
              <Code className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isAr ? 'استوديو تصميم وبرمجة الأكواد العالمية' : 'Global Code Design Studio'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {LANGUAGES_LIST.length}+ {isAr ? 'لغة برمجة' : 'Languages'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'تصميم وكتابة وتوليد أكواد احترافية بجميع الصيغ العالمية' : 'Generate production-ready code in all modern programming languages'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2942] hover:bg-[#283e60] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left / Sidebar: Language Selector */}
          <div className="w-full md:w-64 bg-[#0a1220] border-b md:border-b-0 md:border-r border-[#1e2e46] p-3 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold text-slate-400 mb-2 px-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'اختر لغة البرمجة:' : 'Select Language:'}</span>
            </div>
            <div className="space-y-1">
              {LANGUAGES_LIST.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedLang.id === lang.id
                      ? 'nickel-btn-3d text-slate-900 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-[#16233a] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang.name}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">{lang.extension}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Prompt, Parameters & Code Editor Preview */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d1728] overflow-y-auto custom-scrollbar gap-3">
            
            {/* Input Controls */}
            <div className="bg-[#121f35] p-3.5 rounded-xl border border-[#243650] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'وصف الكود أو الدالة المطلوبة:' : 'Code Prompt / Requirements:'}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    placeholder={isAr ? 'مثال: نظام إدارة المستخدمين مع التشفير وقاعدة البيانات...' : 'e.g. User auth system with encryption and database query...'}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a1220] border border-[#2b3f60] text-xs text-white placeholder:text-slate-500 focus:border-blue-400 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  {inputError && (
                    <p className="text-[11px] text-rose-400 mt-1 font-medium">{inputError}</p>
                  )}
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'إطار العمل / المكتبة:' : 'Framework / Library:'}
                  </label>
                  <input
                    type="text"
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    placeholder={isAr ? 'مثال: React, Express, PyTorch' : 'e.g. React, Django, Spring'}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a1220] border border-[#2b3f60] text-xs text-white placeholder:text-slate-500 focus:border-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-[#1e2e46]">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? `الصيغة المختارة: ${selectedLang.name} (${selectedLang.category})` : `Selected: ${selectedLang.name}`}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="nickel-btn-3d px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? (isAr ? 'جاري التصميم والتوليد...' : 'Generating...') : (isAr ? 'تصميم الكود الذكي' : 'Generate Code')}</span>
                </button>
              </div>
            </div>

            {/* Code Output Canvas */}
            <div className="flex-1 flex flex-col bg-[#080e1a] rounded-xl border border-[#20324c] overflow-hidden min-h-[260px]">
              <div className="px-3.5 py-2 bg-[#0c1524] border-b border-[#20324c] flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>output{selectedLang.extension}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded bg-[#16233a] hover:bg-[#203454] text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer border border-[#2b3f60]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 rounded bg-[#16233a] hover:bg-[#203454] text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer border border-[#2b3f60]"
                  >
                    <Download className="w-3 h-3 text-indigo-400" />
                    <span>{isAr ? 'تحميل كملف' : 'Download'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 font-mono text-xs text-emerald-300 bg-[#080e1a] outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
              />
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#08101d] border-t border-[#243650] flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {isAr ? 'مدعوم بمنظومة التقنية العالمية ونماذج Gemini 3.7' : 'Powered by Global Technology & Gemini 3.7'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#16233a] hover:bg-[#203454] text-slate-300 text-xs font-semibold cursor-pointer border border-[#283d5e]"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={handleSendToChatAction}
              className="nickel-btn-3d px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'مشاركة الكود في المحادثة' : 'Share Code in Chat'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
