import { Question } from "./question.model";

export interface SurveyModel {
  id?:           string;
  createdAt?:    null;
  title:         string;
  description:   string;
  isActive:      boolean;
  userId:        string;
  eventId:       string;
  questions:     Question[];
}
