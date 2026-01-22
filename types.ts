
export enum TargetLanguage {
  RUSSIAN = 'Russian',
  ITALIAN = 'Italian',
  FRENCH = 'French',
  SPANISH = 'Spanish',
  GERMAN = 'German'
}

export interface TranslationState {
  inputHtml: string;
  outputHtml: string;
  isLoading: boolean;
  error: string | null;
  targetLanguage: TargetLanguage;
}
