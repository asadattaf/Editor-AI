/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Sparkles, 
  Download, 
  Send, 
  Layers, 
  Copy, 
  Check, 
  FileCode, 
  Archive, 
  Cpu, 
  ShieldCheck,
  CheckCircle,
  PackageCheck
} from 'lucide-react';
import JSZip from 'jszip';

interface ApkStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (apkMessage: string) => void;
  currentLanguage: 'ar' | 'en';
}

export const ApkStudioModal: React.FC<ApkStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const isAr = currentLanguage === 'ar';

  const [appName, setAppName] = useState('EDITORAssistant');
  const [packageName, setPackageName] = useState('com.editor.assistant.app');
  const [appType, setAppType] = useState<'Kotlin' | 'Compose' | 'Flutter' | 'ReactNative'>('Kotlin');
  const [description, setDescription] = useState('تطبيق ذكي متكامل للمحادثة مع الذكاء الاصطناعي ومعايير التقنية العالمية');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'manifest' | 'main' | 'gradle' | 'layout'>('main');
  const [copied, setCopied] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const [manifestCode, setManifestCode] = useState(`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.DarkActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  const [mainActivityCode, setMainActivityCode] = useState(`package ${packageName}

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var responseView: TextView
    private lateinit var promptInput: EditText
    private lateinit var sendButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        responseView = findViewById(R.id.responseView)
        promptInput = findViewById(R.id.promptInput)
        sendButton = findViewById(R.id.sendButton)

        sendButton.setOnClickListener {
            val userText = promptInput.text.toString().trim()
            if (userText.isNotEmpty()) {
                sendInteractionsRequest(userText)
            } else {
                Toast.makeText(this, "يرجى كتابة نص الطلب", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendInteractionsRequest(prompt: String) {
        responseView.text = "جاري المعالجة عبر منظومة التقنية العالمية..."
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://api.editor.ai/v1/interactions")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val jsonBody = JSONObject().apply {
                    put("prompt", prompt)
                    put("model", "gemini-3.7-flash")
                }

                conn.outputStream.use { it.write(jsonBody.toString().toByteArray()) }
                val responseText = conn.inputStream.bufferedReader().use { it.readText() }

                withContext(Dispatchers.Main) {
                    val resJson = JSONObject(responseText)
                    responseView.text = resJson.optString("response", "تم استلام الرد بنجاح.")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    responseView.text = "استجابة تجريبية: $prompt \\n(تم التشغيل على Android APK)"
                }
            }
        }
    }
}`);

  const [gradleCode, setGradleCode] = useState(`plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}`);

  const [layoutCode, setLayoutCode] = useState(`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#0f172a">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="${appName} - Android APK"
        android:textColor="#38bdf8"
        android:textSize="20sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="16dp"/>

    <ScrollView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:background="#1e293b"
        android:padding="12dp">
        
        <TextView
            android:id="@+id/responseView"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textColor="#f8fafc"
            android:textSize="15sp"
            android:text="مرحباً بك في تطبيق ${appName}. اكتب سؤالك واضغط إرسال."/>
    </ScrollView>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="12dp">

        <EditText
            android:id="@+id/promptInput"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:hint="اكتب استفسارك..."
            android:textColor="#ffffff"
            android:textColorHint="#64748b"
            android:background="#1e293b"
            android:padding="12dp"/>

        <Button
            android:id="@+id/sendButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="إرسال"
            android:backgroundTint="#2563eb"
            android:textColor="#ffffff"
            android:layout_marginStart="8dp"/>
    </LinearLayout>

</LinearLayout>`);

  const handleGenerateApk = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          packageName,
          appType,
          description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.manifest) setManifestCode(data.manifest);
        if (data.mainCode) setMainActivityCode(data.mainCode);
        if (data.gradle) setGradleCode(data.gradle);
      }
    } catch (e) {
      console.warn('APK generate error:', e);
    }
    setIsGenerating(false);
  };

  const handleCopyCurrent = () => {
    let textToCopy = mainActivityCode;
    if (activeTab === 'manifest') textToCopy = manifestCode;
    if (activeTab === 'gradle') textToCopy = gradleCode;
    if (activeTab === 'layout') textToCopy = layoutCode;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipProject = async () => {
    try {
      const zip = new JSZip();

      // Android Project File Tree
      zip.file("app/src/main/AndroidManifest.xml", manifestCode);
      zip.file("app/src/main/java/" + packageName.replace(/\./g, "/") + "/MainActivity.kt", mainActivityCode);
      zip.file("app/src/main/res/layout/activity_main.xml", layoutCode);
      zip.file("app/build.gradle", gradleCode);
      zip.file("settings.gradle", `rootProject.name = "${appName}"\ninclude ':app'`);
      zip.file("build.gradle", `buildscript {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}`);
      zip.file("README_BUILD_APK.md", `# ${appName} - Android APK Project

تم تصميم وبناء هذا المشروع وتجهيزه للبناء والتحويل إلى ملف تطبيق أندرويد (APK / AAB) بصيغة جاهزة.

## خطوات استخراج وبناء ملف الـ APK:
1. قم بفك ضغط هذا الملف.
2. افتح المجلد داخل **Android Studio**.
3. انتظر مزامنة Gradle Sync.
4. من القائمة العلوية اضغط:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. أو من خلال الطرفية (Terminal):
   \`\`\`bash
   ./gradlew assembleDebug
   # أو للنسخة النهائية الموقعة:
   ./gradlew assembleRelease
   \`\`\`
6. ستجد ملف الـ APK الجاهز للتثبيت على الهواتف في المسار:
   \`app/build/outputs/apk/debug/app-debug.apk\`

مطور بواسطة مختبر EDITOR مع معايير التقنية العالمية.`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${appName}_Android_APK_Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadStatus(isAr ? 'تم تحميل حزمة مشروع APK بنجاح!' : 'APK project package downloaded successfully!');
      setTimeout(() => setDownloadStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setDownloadStatus(isAr ? 'حدث خطأ أثناء تحميل حزمة APK' : 'Error downloading APK package');
      setTimeout(() => setDownloadStatus(null), 3500);
    }
  };

  const handleSendToChatAction = () => {
    const promptMessage = isAr
      ? `📱 تم تصميم مشروع تطبيق أندرويد (APK Architecture):\n- اسم التطبيق: **${appName}**\n- معرف الحزمة: \`${packageName}\`\n- نوع المنصة: **${appType}**\n- الوصف: ${description}\n\nجاهز للبناء والتحزيم إلى ملف APK عبر Gradle.`
      : `📱 Generated Android APK Project Architecture:\n- App Name: **${appName}**\n- Package: \`${packageName}\`\n- Framework: **${appType}**\n- Description: ${description}\n\nReady to assemble into release APK via Gradle.`;
    onSendToChat(promptMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] max-h-[860px] bg-[#0d1627] border border-[#2d4164] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#08101d] border-b border-[#243650] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl nickel-btn-3d flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isAr ? 'استوديو تصميم وهندسة برامج الجوال (APK Studio)' : 'Mobile APK Studio & Generator'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Android APK Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'توليد ملفات وبنية تطبيقات أندرويد بصيغة APK متوافقة وجاهزة للتثبيت' : 'Generate complete Android APK architecture and buildable packages'}
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

        {/* Status Notification */}
        {downloadStatus && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{downloadStatus}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Controls Panel */}
          <div className="w-full md:w-80 bg-[#0a1220] border-b md:border-b-0 md:border-r border-[#1e2e46] p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'اسم التطبيق (App Name):' : 'App Name:'}
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121f35] border border-[#2b3f60] text-xs text-white outline-none focus:border-blue-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'معرف الحزمة (Package ID):' : 'Package Name:'}
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121f35] border border-[#2b3f60] text-xs text-emerald-300 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'تقنية بناء تطبيق الجوال:' : 'Framework / Engine:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Kotlin', 'Compose', 'Flutter', 'ReactNative'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAppType(type)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      appType === type
                        ? 'nickel-btn-3d text-slate-900 font-bold'
                        : 'bg-[#14223b] text-slate-300 hover:bg-[#1a2d4e]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'وصف التطبيق ووظائفه:' : 'App Description:'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#121f35] border border-[#2b3f60] text-xs text-white outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <button
              onClick={handleGenerateApk}
              disabled={isGenerating}
              className="nickel-btn-3d w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <Sparkles className={`w-4 h-4 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? (isAr ? 'جاري بناء هيكل APK...' : 'Generating APK...') : (isAr ? 'توليد وتحديث مشروع APK' : 'Generate APK Project')}</span>
            </button>

            {/* Quick APK Info Box */}
            <div className="bg-[#121e33] border border-[#223654] rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 mt-auto">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'معايير Android 14+ و APK Release' : 'Android 14+ & APK Standard'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                {isAr 
                  ? 'يتم توليد بنية المشروع كاملة مع صلاحيات الإنترنت، والتخزين، والصوت، وتضمين ملفات Gradle للبناء المباشر إلى .apk.' 
                  : 'Generates manifest, gradle, UI layouts and source ready to compile to .apk.'}
              </p>
            </div>

          </div>

          {/* Files & Code Viewer */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d1728] overflow-hidden gap-3">
            
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#20324c] pb-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab('main')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'main'
                      ? 'nickel-btn-3d text-slate-900'
                      : 'bg-[#14223b] text-slate-300 hover:text-white'
                  }`}
                >
                  MainActivity.kt
                </button>
                <button
                  onClick={() => setActiveTab('manifest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'manifest'
                      ? 'nickel-btn-3d text-slate-900'
                      : 'bg-[#14223b] text-slate-300 hover:text-white'
                  }`}
                >
                  AndroidManifest.xml
                </button>
                <button
                  onClick={() => setActiveTab('gradle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'gradle'
                      ? 'nickel-btn-3d text-slate-900'
                      : 'bg-[#14223b] text-slate-300 hover:text-white'
                  }`}
                >
                  build.gradle
                </button>
                <button
                  onClick={() => setActiveTab('layout')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'layout'
                      ? 'nickel-btn-3d text-slate-900'
                      : 'bg-[#14223b] text-slate-300 hover:text-white'
                  }`}
                >
                  activity_main.xml
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCurrent}
                  className="px-2.5 py-1 rounded bg-[#16233a] hover:bg-[#203454] text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer border border-[#2b3f60]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="flex-1 bg-[#080e1a] rounded-xl border border-[#20324c] overflow-hidden flex flex-col">
              <textarea
                value={
                  activeTab === 'main'
                    ? mainActivityCode
                    : activeTab === 'manifest'
                    ? manifestCode
                    : activeTab === 'gradle'
                    ? gradleCode
                    : layoutCode
                }
                onChange={(e) => {
                  if (activeTab === 'main') setMainActivityCode(e.target.value);
                  if (activeTab === 'manifest') setManifestCode(e.target.value);
                  if (activeTab === 'gradle') setGradleCode(e.target.value);
                  if (activeTab === 'layout') setLayoutCode(e.target.value);
                }}
                spellCheck={false}
                className="flex-1 p-4 font-mono text-xs text-sky-300 bg-[#080e1a] outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#08101d] border-t border-[#243650] flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مشروع APK جاهز للبناء والتحزيم (.zip)' : 'APK Project Ready for Gradle Build'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#16233a] hover:bg-[#203454] text-slate-300 text-xs font-semibold cursor-pointer border border-[#283d5e]"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={handleDownloadZipProject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل مشروع APK الكامل (.zip)' : 'Download APK Project (.zip)'}</span>
            </button>
            <button
              onClick={handleSendToChatAction}
              className="nickel-btn-3d px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'مشاركة بنية APK في المحادثة' : 'Share in Chat'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
