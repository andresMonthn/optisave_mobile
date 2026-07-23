/**
 * Supabase schema types for optisave_mobile.
 * Kept in sync with `optisave_mobile_esquema_bd.md`.
 */

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type CitaStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      especialidades: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['especialidades']['Insert']>;
      };
      doctores: {
        Row: {
          id: string;
          full_name: string;
          license_number: string | null;
          phone: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_active: boolean;
          is_verified: boolean;
          avg_rating: number;
          review_count: number;
          has_crm_license: boolean;
        } & Timestamped;
        Insert: {
          id: string;
          full_name: string;
          license_number?: string | null;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['doctores']['Insert']>;
      };
      doctor_especialidades: {
        Row: {
          doctor_id: string;
          especialidad_id: string;
        };
        Insert: {
          doctor_id: string;
          especialidad_id: string;
        };
        Update: Partial<Database['public']['Tables']['doctor_especialidades']['Insert']>;
      };
      sedes: {
        Row: {
          id: string;
          doctor_id: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          is_primary: boolean;
        } & Timestamped;
        Insert: {
          id?: string;
          doctor_id: string;
          name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          is_primary?: boolean;
        };
        Update: Partial<Database['public']['Tables']['sedes']['Insert']>;
      };
      servicios: {
        Row: {
          id: string;
          doctor_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          duration_minutes: number | null;
          is_active: boolean;
        } & Timestamped;
        Insert: {
          id?: string;
          doctor_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          duration_minutes?: number | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['servicios']['Insert']>;
      };
      horarios: {
        Row: {
          id: string;
          doctor_id: string;
          location_id: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
        } & Timestamped;
        Insert: {
          id?: string;
          doctor_id: string;
          location_id?: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['horarios']['Insert']>;
      };
      resenas: {
        Row: {
          id: string;
          doctor_id: string;
          reviewer_name: string;
          reviewer_email: string | null;
          rating: number;
          comment: string | null;
          status: ReviewStatus;
          created_at: string;
          moderated_at: string | null;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          reviewer_name: string;
          reviewer_email?: string | null;
          rating: number;
          comment?: string | null;
          status?: ReviewStatus;
        };
        Update: Partial<Database['public']['Tables']['resenas']['Insert']>;
      };
      pacientes: {
        Row: {
          id: string;
          doctor_id: string;
          full_name: string;
          birth_date: string | null;
          phone: string;
          email: string | null;
        } & Timestamped;
        Insert: {
          id?: string;
          doctor_id: string;
          full_name: string;
          birth_date?: string | null;
          phone: string;
          email?: string | null;
        };
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>;
      };
      citas: {
        Row: {
          id: string;
          doctor_id: string;
          paciente_id: string;
          servicio_id: string | null;
          sede_id: string | null;
          fecha: string;
          hora_inicio: string;
          hora_fin: string;
          status: CitaStatus;
        } & Timestamped;
        Insert: {
          id?: string;
          doctor_id: string;
          paciente_id: string;
          servicio_id?: string | null;
          sede_id?: string | null;
          fecha: string;
          hora_inicio: string;
          hora_fin: string;
          status?: CitaStatus;
        };
        Update: Partial<Database['public']['Tables']['citas']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      review_status: ReviewStatus;
      cita_status: CitaStatus;
    };
  };
}
