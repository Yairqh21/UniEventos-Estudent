import { AnswerQuestion } from "./answerQuestions.model";

export interface Answer {
  id?:        string;
  surveyId?:  string;
  eventId?:   string;
  userId?:    string;
  answers?:   AnswerQuestion[];
}
