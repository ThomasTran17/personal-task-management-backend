export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Hashed password, not returned in responses
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
