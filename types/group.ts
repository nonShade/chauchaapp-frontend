export interface GroupMember {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface FamilyGroupResponseDTO {
  family_group_id: string;
  name: string;
  admin: GroupMember;
  members: GroupMember[];
}
