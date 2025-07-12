export const QuestionTypes = {
  MULTIPLE: 'multiple',
  SHORT:    'short',
  TEXT:     'text'
} as const;

export type QuestionType = typeof QuestionTypes[keyof typeof QuestionTypes];

export interface Question {
  id:             string;
  questionText:   string;
  questionType:   QuestionType;
  options:        string[] | null;
}

