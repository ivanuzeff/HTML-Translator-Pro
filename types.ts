
export enum TargetLanguage {
  RUSSIAN = 'Russian',
  ITALIAN = 'Italian',
  FRENCH = 'French',
  SPANISH = 'Spanish',
  GERMAN = 'German'
}

export interface TranslationUnit {
  id: number;
  inputHtml: string;
  outputHtml: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
