export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface Role {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      user_id: number;
      role_id: number;
    };
  }