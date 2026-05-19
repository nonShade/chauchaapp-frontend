import apiClient from './apiClient';
import { FamilyGroup, FamilyMember } from '@/types/family';

export interface CreateFamilyGroupResponse {
  family_group_id: string;
  name: string;
  admin: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  members: Array<{
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

export interface GetFamilyGroupResponse extends CreateFamilyGroupResponse {}

export interface InvitationResponse {
  message: string;
  invitation_id: string;
}

export interface RemoveMemberResponse {
  message: string;
  family_group_id: string;
}

class FamilyGroupService {
  /**
   * Crear un nuevo grupo familiar
   */
  async createFamilyGroup(token: string, name: string): Promise<FamilyGroup> {
    try {
      const response = await apiClient.post<CreateFamilyGroupResponse>(
        '/family-group',
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return this.mapResponseToFamilyGroup(response.data);
    } catch (error) {
      console.error('Error creating family group:', error);
      throw error;
    }
  }

  /**
   * Obtener grupo familiar del usuario autenticado
   */
  async getFamilyGroup(token: string): Promise<FamilyGroup | null> {
    try {
      const response = await apiClient.get<GetFamilyGroupResponse>(
        '/family-group',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return this.mapResponseToFamilyGroup(response.data);
    } catch (error) {
      // Si el usuario no tiene grupo familiar, retornar null
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      console.error('Error fetching family group:', error);
      throw error;
    }
  }

  /**
   * Enviar invitación a un miembro por correo
   */
  async sendInvitation(token: string, email: string): Promise<InvitationResponse> {
    try {
      const response = await apiClient.post<InvitationResponse>(
        '/family-group/invitation',
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  /**
   * Eliminar un miembro del grupo familiar
   */
  async removeMember(token: string, userId: string): Promise<RemoveMemberResponse> {
    try {
      const response = await apiClient.delete<RemoveMemberResponse>(
        `/family-group/member?user_id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Mapear respuesta de API a FamilyGroup
   */
  private mapResponseToFamilyGroup(data: CreateFamilyGroupResponse): FamilyGroup {
    const adminMember: FamilyMember = {
      id: data.admin.user_id,
      first_name: data.admin.first_name,
      last_name: data.admin.last_name,
      email: data.admin.email,
    };

    const members: FamilyMember[] = [
      adminMember,
      ...data.members.map((m) => ({
        id: m.user_id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
      })),
    ];

    return {
      id: data.family_group_id,
      name: data.name,
      created_at: new Date().toISOString(),
      members,
    };
  }
}

export const familyGroupService = new FamilyGroupService();
