export interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  created_at: string;
  members: FamilyMember[];
}
