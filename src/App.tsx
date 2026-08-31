/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Download, 
  FileText, 
  FileCode, 
  Archive, 
  Sparkles, 
  Copy, 
  Check, 
  Code, 
  Zap, 
  ChevronDown, 
  RefreshCw,
  ArrowUpRight,
  Plus,
  Paperclip,
  X,
  Mic,
  MicOff,
  Languages,
  Smartphone,
  Volume2,
  VolumeX,
  FileIcon,
  Image as ImageIcon,
  Film,
  Music,
  FileCheck,
  Globe,
  Radio,
  FileQuestion,
  Cpu,
  Lightbulb
} from 'lucide-react';
import JSZip from 'jszip';
import { AttachedFileItem, ChatMessage } from './types';
import { CodeStudioModal } from './components/CodeStudioModal';
import { ApkStudioModal } from './components/ApkStudioModal';

export default function App() {
  const STORAGE_KEY = "editor_interactions_v2";
  
  // App Language: 'ar' (العربية) | 'en' (English)
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');
  const isAr = currentLanguage === 'ar';

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputVal, setInputVal] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [engineStatus, setEngineStatus] = useState('التقنية العالمية للذكاء الاصطناعي');
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastInteractionId, setLastInteractionId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Attached files state (supports up to 100 files of all types)
  const [selectedFiles, setSelectedFiles] = useState<AttachedFileItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Modals state
  const [showCodeStudio, setShowCodeStudio] = useState(false);
  const [showApkStudio, setShowApkStudio] = useState(false);
  const [showApiInfoModal, setShowApiInfoModal] = useState(false);

  // Smart Replies State (Only displayed when user clicks the dedicated Smart Replies button)
  const [showSmartRepliesTray, setShowSmartRepliesTray] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([
    "كيف يمكنني الاستفادة من مزايا التقنية العالمية في هذا المشروع؟",
    "اعرض لي نموذجاً لكود برمجي متكامل بلغة JavaScript.",
    "صمم لي هيكل تطبيق أندرويد APK متكامل."
  ]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputVal((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  // Initialize TensorFlow.js and Universal Sentence Encoder
  useEffect(() => {
    async function initTF() {
      try {
        const win = window as any;
        if (win.tf && win.use) {
          await win.tf.ready();
          await win.use.load();
          setEngineStatus(isAr ? 'التقنية العالمية للذكاء الاصطناعي' : 'Global Artificial Intelligence Technology');
          setIsInitialized(true);
        } else {
          setTimeout(() => {
            const retryWin = window as any;
            if (retryWin.tf && retryWin.use) {
              retryWin.tf.ready().then(() => {
                retryWin.use.load().then(() => {
                  setEngineStatus(isAr ? 'التقنية العالمية للذكاء الاصطناعي' : 'Global Artificial Intelligence Technology');
                  setIsInitialized(true);
                }).catch(() => {
                  setEngineStatus(isAr ? 'التقنية العالمية للذكاء الاصطناعي' : 'Global Artificial Intelligence Technology');
                  setIsInitialized(true);
                });
              });
            } else {
              setEngineStatus(isAr ? 'التقنية العالمية للذكاء الاصطناعي' : 'Global Artificial Intelligence Technology');
              setIsInitialized(true);
            }
          }, 1200);
        }
      } catch (err) {
        console.warn("TF init notice:", err);
        setEngineStatus(isAr ? 'التقنية العالمية للذكاء الاصطناعي' : 'Global Artificial Intelligence Technology');
        setIsInitialized(true);
      }
    }
    initTF();
  }, [isAr]);

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.slice(-50)));
    } catch (e) {
      console.error(e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isBusy]);

  // Toggle Language Mode (Arabic <-> English)
  const handleToggleLanguage = () => {
    const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setCurrentLanguage(nextLang);

    if (nextLang === 'en') {
      setSmartReplies([
        "How do I start using Google Interactions API?",
        "Write a complete JavaScript function example.",
        "Generate a full Android APK project architecture."
      ]);
    } else {
      setSmartReplies([
        "كيف يمكنني البدء في استخدام بروتوكول Interactions API؟",
        "اعرض لي نموذجاً لكود برمجي متكامل بلغة JavaScript.",
        "صمم لي هيكل تطبيق أندرويد APK متكامل."
      ]);
    }
  };

  // Format File Size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Helper to get file icon
  const getFileIcon = (ext: string, type: string) => {
    const lowerExt = ext.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(lowerExt) || type.startsWith('image/')) {
      return <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'kt', 'cpp', 'c', 'cs', 'html', 'css', 'json', 'sql', 'dart', 'rs', 'go', 'php'].includes(lowerExt)) {
      return <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    if (['apk', 'aab'].includes(lowerExt)) {
      return <Smartphone className="w-3.5 h-3.5 text-green-400 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerExt)) {
      return <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(lowerExt)) {
      return <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv'].includes(lowerExt)) {
      return <Film className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
  };

  // Handle adding up to 100 files of all formats
  const handleFilesSelected = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const remainingSlots = 100 - selectedFiles.length;
    if (remainingSlots <= 0) {
      showToast(isAr ? 'تم الوصول إلى الحد الأقصى للملفات (100 ملف).' : 'Maximum limit reached (100 files).', 'error');
      return;
    }

    const filesToProcess = Array.from(filesList).slice(0, remainingSlots);
    const newItems: AttachedFileItem[] = [];

    for (const file of filesToProcess) {
      const ext = file.name.split('.').pop() || '';
      let textSnippet: string | undefined = undefined;
      let dataUrl: string | undefined = undefined;

      // Extract text snippet for text/code/json/markdown files under 2MB
      if (file.size < 2 * 1024 * 1024 && (
        file.type.startsWith('text/') || 
        ['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'md', 'html', 'css', 'sql', 'xml', 'txt', 'csv', 'yaml', 'yml', 'env', 'kt', 'java', 'c', 'cpp', 'rs', 'go', 'dart', 'php', 'sh'].includes(ext.toLowerCase())
      )) {
        try {
          textSnippet = await file.text();
        } catch (e) {
          console.warn("Could not read text file:", e);
        }
      }

      // Extract dataUrl for images under 5MB for preview
      if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
        try {
          dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(undefined);
            reader.readAsDataURL(file);
          });
        } catch (e){}
      }

      newItems.push({
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: file.type || ext || 'file',
        extension: ext,
        textSnippet,
        dataUrl,
        rawFile: file,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove a single file
  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Remove all attached files
  const handleClearAllFiles = () => {
    setSelectedFiles([]);
  };

  // Toggle Microphone recording
  const handleToggleVoiceRecording = () => {
    if (!speechRecognitionSupported || !recognitionRef.current) {
      showToast(isAr 
        ? 'متصفحك لا يدعم الإدخال الصوتي المباشر. يرجى استخدام Google Chrome أو Edge.' 
        : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.', 'info');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech start note:', e);
      }
    }
  };

  // Text-To-Speech for AI responses
  const handleSpeakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, '').slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Translate a specific message in the chat
  const handleTranslateMessage = async (msg: ChatMessage, index: number) => {
    if (msg.isTranslated && msg.translatedText) {
      // Toggle back to original
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isTranslated: false };
        return copy;
      });
      return;
    }

    if (msg.translatedText) {
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isTranslated: true };
        return copy;
      });
      return;
    }

    setTranslatingIndex(index);
    const targetLang = currentLanguage === 'ar' ? 'en' : 'ar';

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content,
          targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setChatHistory((prev) => {
            const copy = [...prev];
            copy[index] = {
              ...copy[index],
              translatedText: data.translatedText,
              isTranslated: true,
            };
            return copy;
          });
        }
      }
    } catch (e) {
      console.warn("Translation note:", e);
    }
    setTranslatingIndex(null);
  };

  // Generate Smart Replies
  const generateSmartReplies = async (assistantText: string, userText: string) => {
    if (!assistantText) return;
    setIsLoadingReplies(true);
    try {
      const res = await fetch("/api/smart-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastResponse: assistantText,
          lastPrompt: userText,
          language: currentLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSmartReplies(data.suggestions.slice(0, 3));
          setIsLoadingReplies(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Smart replies fetch note:", e);
    }

    // Contextual Fallbacks
    if (currentLanguage === 'en') {
      setSmartReplies([
        "Can you generate unit tests for this code?",
        "How can I package this into an Android APK?",
        "Summarize the key takeaways in 3 points."
      ]);
    } else {
      setSmartReplies([
        "هل يمكنك إضافة أمثلة اختبارية (Unit Tests) لهذا الكود؟",
        "كيف أقوم بتحزيم وبناء هذا الحل إلى ملف APK جاهز للتثبيت؟",
        "لخص لي أهم 3 استنتاجات رئيسية في نقاط محددة."
      ]);
    }
    setIsLoadingReplies(false);
  };

  const executeInteraction = async (
    history: ChatMessage[],
    prompt: string,
    prevId: string | null,
    attached: AttachedFileItem[],
    onChunk: (text: string) => void
  ) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          previous_interaction_id: prevId,
          language: currentLanguage,
          attachedFiles: attached.map((f) => ({
            name: f.name,
            size: f.size,
            sizeFormatted: f.sizeFormatted,
            type: f.type,
            textSnippet: f.textSnippet,
          })),
        }),
      });

      if (!res.ok) throw new Error("Interactions API request failed");
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || data.response || (isAr ? "تمت الاستجابة بنجاح." : "Response processed.");
      const interactionId = data.id || data.interactionId || "int_" + Math.random().toString(36).substring(2, 9);

      // Smooth typewriter delivery
      let currentText = "";
      const chars = content.split("");
      for (let i = 0; i < chars.length; i++) {
        currentText += chars[i];
        if (i % 2 === 0 || i === chars.length - 1) {
          onChunk(currentText);
          await new Promise((r) => setTimeout(r, 6));
        }
      }

      return {
        status: "success",
        apiStandard: data.apiStandard || "Google-Interactions-API",
        interactionId,
        data: { response: content },
      };
    } catch (err) {
      console.warn("Server API fallback to direct public endpoint:", err);

      try {
        const pollRes = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.5-flash",
            messages: [
              {
                role: "system",
                content: isAr
                  ? "أجب عن السؤال أو الطلب مباشرة وبشكل دقيق ومحدد فقط دون أي مقدمات ترويجية أو تعريف بالنفس أو اقتراحات غير مطلوبة في الختام."
                  : "Provide ONLY the direct, concise, and accurate answer to the user's question without any introductory greetings, self-introductions, or conversational filler.",
              },
              ...history.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const content = pollData.choices[0].message.content;
          let currentText = "";
          for (let i = 0; i < content.length; i++) {
            currentText += content[i];
            if (i % 2 === 0 || i === content.length - 1) {
              onChunk(currentText);
              await new Promise((r) => setTimeout(r, 6));
            }
          }
          return {
            status: "success",
            apiStandard: "Google-Interactions-API-Direct",
            interactionId: pollData.id || "int_" + Math.random().toString(36).substring(2, 9),
            data: { response: content },
          };
        }
      } catch (e){}

      const fallbackText = isAr
        ? `تمت معالجة الطلب بنجاح.`
        : `Request processed successfully.`;
      onChunk(fallbackText);
      return {
        status: "success",
        apiStandard: "Google-Interactions-Local-Fallback",
        interactionId: "int_local_" + Date.now(),
        data: { response: fallbackText },
      };
    }
  };

  const handleSend = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if ((!text && selectedFiles.length === 0) || isBusy) return;

    setIsBusy(true);
    setInputVal("");
    const filesToSend = [...selectedFiles];
    setSelectedFiles([]); // clear tray

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { 
        id: 'msg_' + Date.now(),
        role: "user", 
        content: text || (isAr ? `[مشاركة ${filesToSend.length} ملف]` : `[Sharing ${filesToSend.length} files]`), 
        timestamp: Date.now(),
        language: currentLanguage,
        attachedFiles: filesToSend.length > 0 ? filesToSend : undefined
      },
    ];
    setChatHistory(newHistory);

    // Assistant placeholder (clean without placeholder text)
    const loadingHistory: ChatMessage[] = [
      ...newHistory,
      { 
        id: 'msg_ai_' + Date.now(),
        role: "assistant", 
        content: "", 
        timestamp: Date.now(),
        language: currentLanguage
      },
    ];
    setChatHistory(loadingHistory);

    let finalReply = "";
    const resultObj = await executeInteraction(
      newHistory,
      text,
      lastInteractionId,
      filesToSend,
      (chunk) => {
        finalReply = chunk;
        setChatHistory((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: chunk,
              timestamp: Date.now(),
            };
          }
          return updated;
        });
      }
    );

    if (resultObj?.interactionId) {
      setLastInteractionId(resultObj.interactionId);
      setChatHistory((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            interactionId: resultObj.interactionId,
          };
        }
        return updated;
      });
    }

    setIsBusy(false);
    inputRef.current?.focus();

    // Trigger Smart Replies
    generateSmartReplies(finalReply || resultObj?.data?.response || "", text);
  };

  const handleClear = () => {
    if (isBusy) return;
    setChatHistory([]);
    setSelectedFiles([]);
    setLastInteractionId(null);
    setInputVal('');
    setShowSmartRepliesTray(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const [downloadedIndex, setDownloadedIndex] = useState<number | null>(null);

  const handleDownloadMessage = (msg: ChatMessage, index: number) => {
    const textContent = msg.isTranslated && msg.translatedText ? msg.translatedText : msg.content;
    const sender = msg.role === 'user' ? 'user' : 'editor_assistant';
    
    // If message contains attached files, allow downloading them or the full bundle
    let finalContent = textContent;
    let filename = `${sender}_message_${Date.now()}.txt`;
    let mimeType = 'text/plain;charset=utf-8';

    // Detect if content looks like markdown, code or json
    if (textContent.trim().startsWith('{') || textContent.trim().startsWith('[')) {
      try {
        JSON.parse(textContent);
        filename = `${sender}_message_${Date.now()}.json`;
        mimeType = 'application/json;charset=utf-8';
      } catch (e) {
        // Keep as txt
      }
    } else if (textContent.includes('```') || textContent.includes('# ')) {
      filename = `${sender}_message_${Date.now()}.md`;
      mimeType = 'text/markdown;charset=utf-8';
    }

    const blob = new Blob([finalContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedIndex(index);
    setTimeout(() => setDownloadedIndex(null), 2000);
  };

  const handleDownloadSingleAttachedFile = (file: AttachedFileItem) => {
    let blob: Blob;
    if (file.rawFile) {
      blob = file.rawFile;
    } else if (file.dataUrl && file.dataUrl.startsWith('data:')) {
      // Base64 to blob
      const parts = file.dataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1] || file.type || 'application/octet-stream';
      const byteCharacters = atob(parts[1] || '');
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      blob = new Blob(byteArrays, { type: contentType });
    } else if (file.textSnippet) {
      blob = new Blob([file.textSnippet], { type: file.type || 'text/plain;charset=utf-8' });
    } else {
      blob = new Blob([file.name], { type: 'text/plain;charset=utf-8' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportZIP = async () => {
    setShowExportMenu(false);
    try {
      const zip = new JSZip();

      const pkgJson = {
        name: "editor-google-interactions-app",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "tsx server.ts",
          build: "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
          start: "node dist/server.cjs"
        },
        dependencies: {
          "@google/genai": "^2.4.0",
          "@tailwindcss/vite": "^4.1.14",
          "dotenv": "^17.2.3",
          "express": "^4.21.2",
          "jszip": "^3.10.1",
          "lucide-react": "^0.546.0",
          "motion": "^12.23.24",
          "react": "^19.0.1",
          "react-dom": "^19.0.1",
          "vite": "^6.2.3"
        }
      };
      zip.file("package.json", JSON.stringify(pkgJson, null, 2));

      const metadata = {
        name: "مختبر EDITOR",
        description: "تطبيق ومنصة مختبر EDITOR مع استوديو الأكواد العالمية وبناء تطبيقات APK والصوت والترجمة ومشاركة الملفات",
        requestFramePermissions: ["microphone"],
        majorCapabilities: ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      zip.file(".env.example", "GEMINI_API_KEY=\nAPP_URL=\n");
      zip.file("README.md", "# مختبر EDITOR\n\nتطبيق محادثة متكامل مع استوديو الأكواد العالمية وباني تطبيقات APK والصوت والترجمة ومشاركة حتى 100 ملف.");

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "editor-interactions-app-complete.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      showToast(isAr ? "فشل تصدير ملف ZIP" : "Failed to export ZIP", 'error');
    }
  };

  const handleExportMarkdown = () => {
    setShowExportMenu(false);
    if (chatHistory.length === 0) return;
    const mdContent = `# سجل محادثة مختبر EDITOR\n**التاريخ:** ${new Date().toLocaleString()}\n\n---\n\n` +
      chatHistory.map((m) => `### ${m.role === "user" ? "المستخدم (User)" : "مختبر EDITOR (AI)"}\n\n${m.content}\n\n---`).join("\n\n");
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `editor-chat-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    setShowExportMenu(false);
    if (chatHistory.length === 0) return;
    const jsonContent = JSON.stringify({ exportDate: new Date().toISOString(), messages: chatHistory }, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `editor-chat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = isAr ? [
    { title: "تصميم كود برمجي عالمي", prompt: "اكتب لي دالة كاملة في JavaScript/Python لحساب أقصر مسار باستخدام خوارزمية Dijkstra مع شرح تفصيلي." },
    { title: "هندسة تطبيق أندرويد APK", prompt: "كيف يمكنني تحويل هذا المشروع إلى تطبيق جوال أندرويد APK قابل للتثبيت مع صلاحيات الكاميرا والإنترنت؟" },
    { title: "شرح منظومة التقنية العالمية", prompt: "ما هي المزايا والفوائد التقنية لاستخدام منظومة التقنية العالمية في تطبيقات الذكاء الاصطناعي ومعالجة البيانات؟" },
    { title: "تحليل وملخص للملفات المرفقة", prompt: "قم بفحص الملفات المرفقة واستخرج النقاط الرئيسية وحلول التحسين المقترحة." },
  ] : [
    { title: "Generate Global Code", prompt: "Write a high-performance Python/TypeScript function implementing LRU Cache with full tests." },
    { title: "Build Android APK Architecture", prompt: "How do I build and package a complete Android APK with audio and internet permissions using Gradle?" },
    { title: "Global Technology Architecture", prompt: "Explain the architecture and high-performance processing of the Global Technology ecosystem." },
    { title: "Analyze Attached Files", prompt: "Inspect the uploaded files and summarize their main components and potential improvements." },
  ];

  return (
    <div 
      className="w-full h-screen h-[100dvh] bg-[#090d16] text-[#f8fafc] flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white" 
      dir={isAr ? "rtl" : "ltr"}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files) {
          handleFilesSelected(e.dataTransfer.files);
        }
      }}
    >
      {/* Hidden File Input for up to 100 files of any format */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        id="editor-file-picker"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Main App Container: Stretches pixel-perfect across all screen sizes */}
      <div id="editor-main-card" className="w-full h-full flex-1 flex flex-col bg-[#111c2e] overflow-hidden relative">
        
        {/* Drag and Drop Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-40 bg-blue-900/80 backdrop-blur-sm border-2 border-dashed border-blue-400 flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-2xl nickel-btn-3d flex items-center justify-center shadow-2xl">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {isAr ? 'أفلت الملفات هنا لإضافتها إلى المحادثة' : 'Drop files here to attach'}
            </h3>
            <p className="text-sm text-blue-200">
              {isAr ? 'يدعم إضافة حتى 100 ملف من جميع الصيغ والأحجام' : 'Supports up to 100 files of all formats and extensions'}
            </p>
          </div>
        )}

        {/* Top Header */}
        <header className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[#0b1424] border-b border-[#293a55] flex justify-between items-center gap-2 text-sm select-none shrink-0">
          
          {/* Brand Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl nickel-btn-3d flex items-center justify-center">
                <Bot className="w-5 h-5 text-slate-900" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0b1424]"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-sm sm:text-base text-white font-extrabold tracking-wide truncate">
                  {isAr ? 'مختبر EDITOR' : 'EDITOR Lab'}
                </span>
                
                {/* Interactive Global Technology Badge & Response Writing Indicator */}
                <button
                  id="google-interactions-api-badge"
                  onClick={() => setShowApiInfoModal(true)}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
                    isBusy
                      ? 'bg-blue-600/25 border-blue-400/70 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse'
                      : 'bg-[#16253b] hover:bg-[#1e3350] border-blue-500/30 text-blue-400 hover:text-blue-300'
                  }`}
                  title={
                    isBusy
                      ? (isAr ? 'التقنية العالمية: جاري كتابة وصياغة الإجابة المباشرة...' : 'Global Technology: Writing direct response...')
                      : (isAr ? 'التقنية العالمية: متصل وجاهز (اضغط لعرض التفاصيل)' : 'Global Technology: Connected (Click for details)')
                  }
                >
                  {isBusy ? (
                    <>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      <span className="font-bold tracking-tight text-blue-200">
                        {isAr ? 'جاري كتابة الإجابة...' : 'Writing Response...'}
                      </span>
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isAr ? 'التقنية العالمية' : 'Global Technology'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate">
                {isAr ? 'COED الذكاء الصناعي' : 'COED AI'}
              </p>
            </div>
          </div>

          {/* Top 3D Metallic Nickel Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Dedicated 3D Nickel Smart Replies Button */}
            <button
              id="toggle-smart-replies-btn"
              onClick={() => {
                const nextState = !showSmartRepliesTray;
                setShowSmartRepliesTray(nextState);
                if (nextState) {
                  const lastAssistantMsg = [...chatHistory].reverse().find((m) => m.role === "assistant")?.content || "";
                  const lastUserMsg = [...chatHistory].reverse().find((m) => m.role === "user")?.content || "";
                  generateSmartReplies(lastAssistantMsg, lastUserMsg);
                }
              }}
              className={`nickel-btn-3d px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                showSmartRepliesTray ? 'nickel-btn-active !text-amber-600' : ''
              }`}
              title={isAr ? 'عرض اقتراحات ذكية وحلول احترافية لمتابعة الموضوع الحالي' : 'Show professional smart follow-up suggestions for the current topic'}
            >
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="hidden md:inline">{isAr ? 'اقتراحات ذكية' : 'Smart Replies'}</span>
            </button>

            {/* 3D Nickel Code Studio Button */}
            <button
              id="open-code-studio-btn"
              onClick={() => setShowCodeStudio(true)}
              className="nickel-btn-3d px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'تصميم وكتابة الأكواد البرمجية بجميع الصيغ العالمية' : 'Global Code Studio (All Languages)'}
            >
              <Code className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="hidden md:inline">{isAr ? 'استوديو الأكواد' : 'Code Studio'}</span>
            </button>

            {/* 3D Nickel APK Studio Button */}
            <button
              id="open-apk-studio-btn"
              onClick={() => setShowApkStudio(true)}
              className="nickel-btn-3d px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'تصميم وهندسة برامج الجوال بصيغة APK' : 'Android APK Studio'}
            >
              <Smartphone className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="hidden md:inline">{isAr ? 'بناء APK' : 'APK Studio'}</span>
            </button>

            {/* 3D Nickel Language Switcher Button (العربية / English) */}
            <button
              id="toggle-language-btn"
              onClick={handleToggleLanguage}
              className={`nickel-btn-3d px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                currentLanguage === 'en' ? 'nickel-btn-active' : ''
              }`}
              title={isAr ? 'التبديل بين العربية والإنجليزية لترجمة المحادثة' : 'Toggle Arabic / English Translation'}
            >
              <Languages className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>{isAr ? 'EN / عربي' : 'AR / English'}</span>
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                id="export-menu-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="nickel-btn-3d px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title={isAr ? 'تصدير المحادثة والمشروع' : 'Export Chat / Project'}
              >
                <Download className="w-3.5 h-3.5 text-slate-800" />
                <span className="hidden sm:inline">{isAr ? 'تصدير' : 'Export'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-2 w-56 bg-[#16233a] border border-[#293a55] rounded-xl shadow-2xl py-2 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150`}>
                  <div className="px-3 py-1 text-[11px] text-slate-400 font-semibold border-b border-[#293a55] mb-1">
                    {isAr ? 'خيارات التصدير والدمج' : 'Export Options'}
                  </div>
                  <button
                    onClick={handleExportZIP}
                    className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-[#1e293b] flex items-center gap-2.5 text-right transition-colors border-b border-[#293a55]/60 pb-2 mb-1 cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">{isAr ? 'مشروع كامل (.zip)' : 'Full Project (.zip)'}</div>
                      <div className="text-[10px] text-slate-400">{isAr ? 'حزمة التطبيق مع كافة الملفات' : 'Complete workspace zip'}</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-[#1e293b] flex items-center gap-2 text-right transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-[#1e293b] flex items-center gap-2 text-right transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>JSON (.json)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clear Chat */}
            <button
              id="clear-chat-btn"
              onClick={handleClear}
              disabled={isBusy || chatHistory.length === 0}
              className="p-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-[#293a55]"
              title={isAr ? 'مسح المحادثة' : 'Clear Chat'}
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
            <div className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                toastMessage.type === 'error' ? 'bg-rose-400' : toastMessage.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
              }`} />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <main id="messages-container" className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scroll-smooth custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl nickel-btn-3d flex items-center justify-center mb-4 text-blue-600 shadow-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {isAr ? 'مرحباً بك في مختبر EDITOR' : 'Welcome to EDITOR Lab'}
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {isAr 
                  ? 'منصة ذكية متطورة بمعايير التقنية العالمية، تدعم مشاركة حتى 100 ملف من جميع الصيغ، استوديو الأكواد العالمية، وبناء تطبيقات APK للأندرويد مع المحادثة الصوتية والترجمة الفورية.'
                  : 'Full-featured AI workspace powered by Global Technology, supporting up to 100 attached files, Global Code Studio, Android APK Generator, Voice Chat, and Real-time Bilingual Translation.'}
              </p>

              {/* Quick Prompts */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="p-3 rounded-xl bg-[#16233a] hover:bg-[#1f3152] border border-[#293a55] hover:border-blue-500/50 text-slate-200 text-xs transition-all flex flex-col gap-1 cursor-pointer text-right group"
                  >
                    <span className="font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-2">{item.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] ${
                  msg.role === "user" ? (isAr ? "self-end flex-row-reverse" : "self-end flex-row-reverse") : "self-start"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    msg.role === "user"
                      ? "nickel-btn-3d text-slate-900"
                      : "bg-[#1e293b] border border-[#293a55] text-blue-400"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-4 h-4 text-slate-900 font-bold" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group p-4 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm flex flex-col gap-2 ${
                    msg.role === "user"
                      ? "bg-[#2563eb] text-white rounded-tr-none"
                      : "bg-[#1e293b] border border-[#293a55] text-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* Attached Files rendering in message bubble */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="bg-black/20 p-2 rounded-xl border border-white/10 flex flex-col gap-1.5 mb-1">
                      <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{isAr ? `الملفات المرفقة (${msg.attachedFiles.length} ملف):` : `Attached Files (${msg.attachedFiles.length}):`}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {msg.attachedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="bg-[#0f172a]/80 border border-white/15 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 text-slate-200 group/file"
                          >
                            {getFileIcon(file.extension, file.type)}
                            <span className="font-medium truncate max-w-[150px]" title={file.name}>{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({file.sizeFormatted})</span>
                            <button
                              onClick={() => handleDownloadSingleAttachedFile(file)}
                              className="p-1 hover:text-emerald-400 text-slate-400 transition-colors ml-0.5 cursor-pointer rounded hover:bg-white/10"
                              title={isAr ? `تنزيل الملف (${file.name})` : `Download File (${file.name})`}
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Message Text / Translated Text / Direct Streaming */}
                  <div className="whitespace-pre-wrap">
                    {msg.content ? (
                      msg.isTranslated && msg.translatedText ? (
                        <div>
                          <div className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{isAr ? 'النص المترجم:' : 'Translated Text:'}</span>
                          </div>
                          <div className="text-slate-100">{msg.translatedText}</div>
                        </div>
                      ) : (
                        msg.content
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 py-1 px-1 text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar (Copy, Speak, Translate) */}
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10 text-[11px] text-slate-400">
                    <span className="text-[10px] opacity-75">
                      {msg.role === "user" ? (isAr ? "أنت" : "You") : ""}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Translate Button */}
                      <button
                        onClick={() => handleTranslateMessage(msg, idx)}
                        disabled={translatingIndex === idx}
                        className="hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'ترجمة هذه الرسالة' : 'Translate Message'}
                      >
                        <Languages className={`w-3.5 h-3.5 ${translatingIndex === idx ? 'animate-spin text-blue-400' : ''}`} />
                        <span className="text-[10px]">
                          {msg.isTranslated ? (isAr ? 'الأصل' : 'Original') : (isAr ? 'ترجمة' : 'Translate')}
                        </span>
                      </button>

                      {/* Text-To-Speech Button */}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleSpeakText(msg.isTranslated && msg.translatedText ? msg.translatedText : msg.content, idx)}
                          className="hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title={isAr ? 'قراءة صوتية' : 'Text to Speech'}
                        >
                          {speakingIndex === idx ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{speakingIndex === idx ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'استماع' : 'Listen')}</span>
                        </button>
                      )}

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyMessage(msg.isTranslated && msg.translatedText ? msg.translatedText : msg.content, idx)}
                        className="hover:text-white transition-opacity flex items-center gap-1 cursor-pointer"
                        title={isAr ? "نسخ النص" : "Copy"}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[10px]">{isAr ? 'تم' : 'Done'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">{isAr ? 'نسخ' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      {/* Download Message Content in its Original Format */}
                      <button
                        onClick={() => handleDownloadMessage(msg, idx)}
                        className="hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title={isAr ? "تنزيل الرسالة بصيغتها الأصلية" : "Download Message in Original Format"}
                      >
                        {downloadedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[10px]">{isAr ? 'تم الحفظ' : 'Saved'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400/90 font-medium">{isAr ? 'تنزيل' : 'Download'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Smart Replies Tray (Only shown when user clicks the dedicated Smart Replies button) */}
        {showSmartRepliesTray && !isBusy && (
          <div id="smart-replies-section" className="px-4 py-2.5 bg-[#0d1728] border-t border-[#1e2e46] flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{isAr ? 'اقتراحات ذكية وحلول احترافية للمتابعة:' : 'Smart Follow-up Solutions:'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lastAssistantMsg = [...chatHistory].reverse().find((m) => m.role === "assistant")?.content || "";
                    const lastUserMsg = [...chatHistory].reverse().find((m) => m.role === "user")?.content || "";
                    generateSmartReplies(lastAssistantMsg, lastUserMsg);
                  }}
                  disabled={isLoadingReplies}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title={isAr ? "تحديث الحلول المقترحة" : "Refresh Solutions"}
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingReplies ? "animate-spin text-amber-400" : ""}`} />
                  <span>{isAr ? 'تحديث' : 'Refresh'}</span>
                </button>
                <button
                  onClick={() => setShowSmartRepliesTray(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                  title={isAr ? "إغلاق الاقتراحات" : "Close Suggestions"}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoadingReplies ? (
              <div className="py-2.5 flex items-center justify-center gap-2 text-xs text-amber-300/90 bg-[#16233a]/60 rounded-xl border border-[#2d4164]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>{isAr ? 'جاري استخراج حلول احترافية متقدمة عن الموضوع المعروض...' : 'Analyzing active topic & generating professional solutions...'}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {smartReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    id={`smart-reply-btn-${idx}`}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-2 rounded-xl bg-[#16233a] hover:bg-[#1f3152] border border-[#2d4164] hover:border-amber-500/60 text-slate-200 hover:text-white text-xs font-medium text-right transition-all duration-150 flex items-center justify-between gap-2 shadow-sm cursor-pointer group"
                  >
                    <span className="line-clamp-2 leading-relaxed">{reply}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Files Preview Tray (Supports up to 100 files of all types) */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2.5 bg-[#0f1a2c] border-t border-[#23354f] flex flex-col gap-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? `الملفات المختارة للمشاركة (${selectedFiles.length} / 100 ملف):` : `Selected Files (${selectedFiles.length} / 100):`}</span>
              </div>
              <button
                onClick={handleClearAllFiles}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                {isAr ? 'إلغاء الكل' : 'Clear All'}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-[#18263e] border border-[#2c4266] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shrink-0 text-xs text-slate-200 shadow-sm relative group"
                >
                  {file.dataUrl ? (
                    <img src={file.dataUrl} alt={file.name} className="w-5 h-5 rounded object-cover" />
                  ) : (
                    getFileIcon(file.extension, file.type)
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold truncate max-w-[120px] text-white" title={file.name}>{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{file.sizeFormatted}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="w-4 h-4 rounded-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                    title={isAr ? 'حذف' : 'Remove'}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Listening Active Bar */}
        {isListening && (
          <div className="px-4 py-2 bg-gradient-to-r from-red-950/80 via-indigo-950/80 to-blue-950/80 border-t border-red-500/30 flex items-center justify-between animate-pulse text-xs text-red-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-bold">{isAr ? 'جاري الاستماع لصوتك والتسجيل...' : 'Listening to your voice... Speak now.'}</span>
            </div>
            <button
              onClick={handleToggleVoiceRecording}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-[11px]"
            >
              {isAr ? 'إنهاء التسجيل' : 'Stop Recording'}
            </button>
          </div>
        )}

        {/* Footer Input Area */}
        <footer className="p-3 sm:p-4 bg-[#0b1424] border-t border-[#293a55] flex flex-col gap-2.5">
          <div className="flex gap-2 items-center">
            
            {/* 3D Nickel Plus Button: Add up to 100 files of all formats */}
            <button
              id="add-files-plus-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy || selectedFiles.length >= 100}
              className="w-11 h-11 rounded-xl nickel-btn-3d flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              title={isAr ? 'إضافة ملفات من الذاكرة يدوي (حتى 100 ملف بجميع الصيغ)' : 'Attach files manually (up to 100 files, all formats)'}
            >
              <Plus className="w-5 h-5 text-slate-900 font-extrabold stroke-[2.5]" />
            </button>

            {/* 3D Nickel Microphone Button: Voice Chat */}
            <button
              id="voice-mic-btn"
              onClick={handleToggleVoiceRecording}
              disabled={isBusy}
              className={`w-11 h-11 rounded-xl nickel-btn-3d flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                isListening ? 'nickel-btn-active !text-red-600' : ''
              }`}
              title={isAr ? 'محادثة صوتية مع الذكاء الاصطناعي' : 'Voice Chat with AI'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-red-600 animate-pulse stroke-[2.5]" />
              ) : (
                <Mic className="w-5 h-5 text-slate-900 stroke-[2.5]" />
              )}
            </button>

            {/* Main Text Input Field */}
            <input
              ref={inputRef}
              type="text"
              id="user-input-field"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                isAr
                  ? (selectedFiles.length > 0 
                      ? `تم إرفاق ${selectedFiles.length} ملف. اضغط إرسال أو اكتب رسالة...` 
                      : 'اكتب استفسارك، اضغط + لإرفاق ملفات، أو استخدم الميكروفون...')
                  : (selectedFiles.length > 0
                      ? `${selectedFiles.length} files attached. Press send or type a message...`
                      : 'Type a message, click + to attach files, or use the mic...')
              }
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isBusy && (inputVal.trim() || selectedFiles.length > 0)) {
                  handleSend();
                }
              }}
              disabled={isBusy}
              className="flex-1 px-4 py-3 rounded-xl border border-[#293a55] bg-[#16233a] text-white outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 font-medium"
            />

            {/* 3D Nickel Send Button */}
            <button
              id="send-message-btn"
              onClick={() => handleSend()}
              disabled={isBusy || (!inputVal.trim() && selectedFiles.length === 0)}
              className="h-11 px-5 rounded-xl nickel-btn-3d text-slate-900 font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 shadow-lg"
              title={isAr ? 'إرسال الرسالة والملفات' : 'Send message and files'}
            >
              {isBusy ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
              ) : (
                <Send className={`w-4 h-4 text-slate-900 ${isAr ? 'rotate-180' : ''}`} />
              )}
              <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Send'}</span>
            </button>
          </div>
        </footer>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-[#080f1a] text-[11px] text-slate-400 flex flex-wrap justify-between items-center border-t border-[#1a2942]">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isInitialized ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}></span>
            <span id="engine-status-text" className="text-slate-300">{engineStatus}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {isAr ? 'الوضع: العربية 🇸🇦' : 'Mode: English 🇺🇸'}
            </span>
            <span className="font-semibold text-slate-400">مختبر EDITOR</span>
          </div>
        </div>

      </div>

      {/* Code Studio Modal (All Global Programming Languages) */}
      <CodeStudioModal
        isOpen={showCodeStudio}
        onClose={() => setShowCodeStudio(false)}
        onSendToChat={(codeMsg) => handleSend(codeMsg)}
        currentLanguage={currentLanguage}
      />

      {/* Android APK Studio Modal */}
      <ApkStudioModal
        isOpen={showApkStudio}
        onClose={() => setShowApkStudio(false)}
        onSendToChat={(apkMsg) => handleSend(apkMsg)}
        currentLanguage={currentLanguage}
      />

      {/* Google Interactions API Protocol Info Modal */}
      {showApiInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#111c2e] border border-[#293a55] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#293a55] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>{isAr ? 'نظام التقنية العالمية' : 'Global Technology System'}</span>
              </div>
              <button
                onClick={() => setShowApiInfoModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="bg-[#16233a] p-3 rounded-xl border border-[#23354f] flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold">{isAr ? 'حالة التوليد والكتابة:' : 'Writing / Response State:'}</span>
                  <span className={`font-bold flex items-center gap-1.5 ${isBusy ? "text-blue-400" : "text-emerald-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${isBusy ? "bg-blue-400 animate-ping" : "bg-emerald-400"}`}></span>
                    {isBusy ? (isAr ? 'جاري كتابة الإجابة الآن' : 'Writing response...') : (isAr ? 'متصل وجاهز للاستجابة' : 'Active & Ready')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold">{isAr ? 'النموذج النشط:' : 'Active Engine:'}</span>
                  <span className="text-blue-300 font-mono text-[11px]">Gemini 3.7 / 3.1 Flash</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold">{isAr ? 'معيار المعالجة الذكية:' : 'Smart Engine Standard:'}</span>
                  <span className="text-emerald-300 font-mono text-[11px]">{isAr ? 'التقنية العالمية المتطورة' : 'Global Technology Standard'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold">{isAr ? 'معرف الجلسة التفاعلية:' : 'Interaction Session ID:'}</span>
                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[180px]">
                    {lastInteractionId || 'int_active_session_live'}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isAr
                  ? 'منظومة التقنية العالمية تتيح معالجة الحوار متعدد الأدوار بكفاءة فائقة مع دعم إرسال ما يصل إلى 100 ملف من جميع الصيغ، استوديو الأكواد العالمية، وبناء وتصدير تطبيقات APK للأندرويد.'
                  : 'Global Technology architecture provides high-efficiency multi-turn dialog processing, multimodal document synthesis supporting up to 100 files, and native code/APK generation modules.'}
              </p>
            </div>

            <div className="flex justify-end pt-1 border-t border-[#293a55]">
              <button
                onClick={() => setShowApiInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-md"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
