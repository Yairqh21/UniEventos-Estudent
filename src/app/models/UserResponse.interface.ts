import { User } from "./user.model";

export interface UserResponse{
  user: User;
  token: string;
}
// id:        string,
// username:  string,
// email:     string,
// role:      string,
// token:     string,
