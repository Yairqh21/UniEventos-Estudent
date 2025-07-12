export interface EventParticipation {
  id:               string;
  eventId:          string;
  eventDateTime?:   Date;
  eventTitle?:      string;
  eventLocation?:   string;
  eventModality?:   string;
  eventImgUrl?:     string;
  participantId?:   string;
  isAttended:       boolean;
  ticketCode?:      string;
  registrationDate: string;
}
