export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          organization_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          organization_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          organization_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          assigned_user_id: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          notes: string | null;
          organization_id: string;
          phone: string | null;
          status: Database["public"]["Enums"]["client_status"];
          updated_at: string;
        };
        Insert: {
          assigned_user_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string | null;
          organization_id: string;
          phone?: string | null;
          status?: Database["public"]["Enums"]["client_status"];
          updated_at?: string;
        };
        Update: {
          assigned_user_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          phone?: string | null;
          status?: Database["public"]["Enums"]["client_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_assigned_user_id_fkey";
            columns: ["assigned_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["member_role"];
          status: Database["public"]["Enums"]["member_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_user_id: string;
          slug: string;
          updated_at: string;
          vertical: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_user_id: string;
          slug: string;
          updated_at?: string;
          vertical: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_user_id?: string;
          slug?: string;
          updated_at?: string;
          vertical?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_prices: {
        Row: {
          billing_type: Database["public"]["Enums"]["service_billing_type"];
          created_at: string;
          currency: string;
          id: string;
          interval: Database["public"]["Enums"]["service_interval"] | null;
          organization_id: string;
          price_amount: number;
          service_id: string;
          updated_at: string;
        };
        Insert: {
          billing_type: Database["public"]["Enums"]["service_billing_type"];
          created_at?: string;
          currency?: string;
          id?: string;
          interval?: Database["public"]["Enums"]["service_interval"] | null;
          organization_id: string;
          price_amount: number;
          service_id: string;
          updated_at?: string;
        };
        Update: {
          billing_type?: Database["public"]["Enums"]["service_billing_type"];
          created_at?: string;
          currency?: string;
          id?: string;
          interval?: Database["public"]["Enums"]["service_interval"] | null;
          organization_id?: string;
          price_amount?: number;
          service_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_prices_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_prices_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          description: string | null;
          duration_minutes: number | null;
          id: string;
          name: string;
          organization_id: string;
          service_type: Database["public"]["Enums"]["service_type"];
          status: Database["public"]["Enums"]["service_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          name: string;
          organization_id: string;
          service_type: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["service_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          name?: string;
          organization_id?: string;
          service_type?: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["service_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization_with_owner: {
        Args: {
          p_name: string;
          p_slug: string;
          p_vertical: string;
        };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      has_org_role: {
        Args: {
          p_organization_id: string;
          p_roles: string[];
          p_user_id?: string;
        };
        Returns: boolean;
      };
      is_org_member: {
        Args: {
          p_organization_id: string;
          p_user_id?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      client_status: "lead" | "active" | "inactive";
      member_role: "owner" | "admin" | "staff" | "client";
      member_status: "active" | "invited" | "disabled";
      service_billing_type: "one_time" | "recurring";
      service_interval: "week" | "month" | "year";
      service_status: "draft" | "active" | "archived";
      service_type: "one_to_one" | "group" | "subscription" | "package";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];

export type PublicTableName = keyof PublicSchema["Tables"];

export type TableRow<T extends PublicTableName> = PublicSchema["Tables"][T]["Row"];
