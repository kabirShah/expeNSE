export interface GroupMember {
  id?: number;
  group_id?: number;
  user_id?: number | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  is_app_user?: boolean;
  notification_preferences?: { email?: boolean; sms?: boolean; whatsapp?: boolean; };
  created_at?: string;
}
