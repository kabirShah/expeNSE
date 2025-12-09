export interface GroupMember {
  id: number;
  group_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: number;
  name: string;
  created_by: number;
  members?: GroupMember[];
  created_at?: string;
  updated_at?: string;
}
