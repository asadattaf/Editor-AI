/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  textSnippet?: string;
  dataUrl?: string;
  rawFile?: File;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  interactionId?: string;
  language?: 'ar' | 'en';
  attachedFiles?: AttachedFileItem[];
  translatedText?: string;
  isTranslated?: boolean;
}

export interface ProgrammingLanguage {
  id: string;
  name: string;
  extension: string;
  category: string;
  defaultSnippet: string;
}
