export interface Events {
  id:                 string;
  userCreatedId:      string;
  eventType:          string;
  eventModality:      string;
  linkUrl:            string;
  imgUrl:             string;
  eventName:          string;
  description:        string;
  eventDateTime:      Date;
  location:           string;
  targetAudience:     string[];
  status:             string;
  cancellationReason: string;
  sponsor:            string;
  createdAt:          { seconds: number; nanos: number };
}
