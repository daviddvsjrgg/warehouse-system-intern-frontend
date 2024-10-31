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