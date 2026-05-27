export interface Notification {
  notification_id: string;
  user_id: string;
  notification_type: "tip" | "family_group_request" | string;
  notification_status: string;
  message: string;
  scheduled_date: string;
  reference_id: string;
  reference_type: string;
}