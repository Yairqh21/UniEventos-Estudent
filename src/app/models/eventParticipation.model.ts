export interface EventParticipationModel {
  id:               string;
  eventId:          string;
  participantId?:   string;
  isAttended:       boolean;
  ticketCode?:      string;
  registrationDate: string;
}
