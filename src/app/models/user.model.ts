import { role } from "./role.enum";

export interface User {

  id:             string;
  username:       string;
  password:       string;
  email:          string;
  firstName:      string;
  lastName:       string;
  phoneNumber:    string;
  career:         string;
  academicCycle:  string;
  imgUrl:         string;
  role:           role;
  isActive:       boolean;

}

