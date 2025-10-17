export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string;
          appointment_time: string;
          created_at: string;
          department: string | null;
          doctor_id: string;
          id: string;
          notes: string | null;
          patient_id: string;
          status: string;
          updated_at: string;
          visit_type: string;
        };
        Insert: {
          appointment_date: string;
          appointment_time: string;
          created_at?: string;
          department?: string | null;
          doctor_id: string;
          id?: string;
          notes?: string | null;
          patient_id: string;
          status?: string;
          updated_at?: string;
          visit_type: string;
        };
        Update: {
          appointment_date?: string;
          appointment_time?: string;
          created_at?: string;
          department?: string | null;
          doctor_id?: string;
          id?: string;
          notes?: string | null;
          patient_id?: string;
          status?: string;
          updated_at?: string;
          visit_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          address: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          created_at: string;
          department: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          license_number: string | null;
          phone: string | null;
          specialization: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          department?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          license_number?: string | null;
          phone?: string | null;
          specialization: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          department?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          license_number?: string | null;
          phone?: string | null;
          specialization?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          address: string | null;
          created_at: string;
          date_of_joining: string | null;
          department: string | null;
          email: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          employee_id: string;
          employee_type: string;
          first_name: string;
          id: string;
          last_name: string;
          license_number: string | null;
          phone: string;
          salary: number | null;
          specialization: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          date_of_joining?: string | null;
          department?: string | null;
          email: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          employee_id: string;
          employee_type: string;
          first_name: string;
          id?: string;
          last_name: string;
          license_number?: string | null;
          phone: string;
          salary?: number | null;
          specialization?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          date_of_joining?: string | null;
          department?: string | null;
          email?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          employee_id?: string;
          employee_type?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          license_number?: string | null;
          phone?: string;
          salary?: number | null;
          specialization?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          created_at: string;
          id: string;
          inventory_id: string;
          notes: string | null;
          quantity: number;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          inventory_id: string;
          notes?: string | null;
          quantity: number;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          inventory_id?: string;
          notes?: string | null;
          quantity?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_id_fkey";
            columns: ["inventory_id"];
            isOneToOne: false;
            referencedRelation: "medicine_inventory";
            referencedColumns: ["id"];
          }
        ];
      };
      medicine_inventory: {
        Row: {
          active: boolean;
          batch_number: string | null;
          common_complaints: string[];
          created_at: string;
          expiry_date: string | null;
          form: string | null;
          generic_name: string | null;
          id: string;
          location_shelf_number: string | null;
          manufacturer: string | null;
          medicine_id: string | null;
          name: string;
          price_per_unit: number | null;
          reorder_level: number | null;
          side_effects: string | null;
          stock_quantity: number;
          storage_requirements: string | null;
          strength: string | null;
          updated_at: string;
          usage_instructions: string | null;
        };
        Insert: {
          active?: boolean;
          batch_number?: string | null;
          common_complaints?: string[];
          created_at?: string;
          expiry_date?: string | null;
          form?: string | null;
          generic_name?: string | null;
          id?: string;
          location_shelf_number?: string | null;
          manufacturer?: string | null;
          medicine_id?: string | null;
          name: string;
          price_per_unit?: number | null;
          reorder_level?: number | null;
          side_effects?: string | null;
          stock_quantity?: number;
          storage_requirements?: string | null;
          strength?: string | null;
          updated_at?: string;
          usage_instructions?: string | null;
        };
        Update: {
          active?: boolean;
          batch_number?: string | null;
          common_complaints?: string[];
          created_at?: string;
          expiry_date?: string | null;
          form?: string | null;
          generic_name?: string | null;
          id?: string;
          location_shelf_number?: string | null;
          manufacturer?: string | null;
          medicine_id?: string | null;
          name?: string;
          price_per_unit?: number | null;
          reorder_level?: number | null;
          side_effects?: string | null;
          stock_quantity?: number;
          storage_requirements?: string | null;
          strength?: string | null;
          updated_at?: string;
          usage_instructions?: string | null;
        };
        Relationships: [];
      };
      medicine_suppliers: {
        Row: {
          created_at: string;
          id: string;
          medicine_id: string;
          price_per_unit: number | null;
          supplier_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          medicine_id: string;
          price_per_unit?: number | null;
          supplier_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          medicine_id?: string;
          price_per_unit?: number | null;
          supplier_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medicine_suppliers_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicine_inventory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medicine_suppliers_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      patients: {
        Row: {
          address: string | null;
          blood_group: string | null;
          created_at: string;
          date_of_birth: string | null;
          email: string | null;
          first_name: string | null;
          gender: string | null;
          id: string;
          last_name: string | null;
          medical_history: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          blood_group?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          last_name?: string | null;
          medical_history?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          blood_group?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          last_name?: string | null;
          medical_history?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      prescriptions: {
        Row: {
          advice: string | null;
          appointment_id: string;
          blood_pressure: string | null;
          bmi: string | null;
          complaints: string[] | null;
          created_at: string;
          doctor_id: string;
          doctor_notes: string | null;
          height: string | null;
          id: string;
          medicines: Json | null;
          next_visit: string | null;
          patient_id: string;
          pulse: string | null;
          spo2: string | null;
          tests_prescribed: string | null;
          updated_at: string;
          visit_date: string;
          weight: string | null;
        };
        Insert: {
          advice?: string | null;
          appointment_id: string;
          blood_pressure?: string | null;
          bmi?: string | null;
          complaints?: string[] | null;
          created_at?: string;
          doctor_id: string;
          doctor_notes?: string | null;
          height?: string | null;
          id?: string;
          medicines?: Json | null;
          next_visit?: string | null;
          patient_id: string;
          pulse?: string | null;
          spo2?: string | null;
          tests_prescribed?: string | null;
          updated_at?: string;
          visit_date: string;
          weight?: string | null;
        };
        Update: {
          advice?: string | null;
          appointment_id?: string;
          blood_pressure?: string | null;
          bmi?: string | null;
          complaints?: string[] | null;
          created_at?: string;
          doctor_id?: string;
          doctor_notes?: string | null;
          height?: string | null;
          id?: string;
          medicines?: Json | null;
          next_visit?: string | null;
          patient_id?: string;
          pulse?: string | null;
          spo2?: string | null;
          tests_prescribed?: string | null;
          updated_at?: string;
          visit_date?: string;
          weight?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_prescription_appointment";
            columns: ["appointment_id"];
            isOneToOne: true;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_prescription_patient";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          }
        ];
      };
      sale_items: {
        Row: {
          created_at: string | null;
          id: string;
          medicine_id: string;
          quantity: number;
          sale_id: string;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          medicine_id: string;
          quantity: number;
          sale_id: string;
          total_price: number;
          unit_price: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          medicine_id?: string;
          quantity?: number;
          sale_id?: string;
          total_price?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_items_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicine_inventory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          }
        ];
      };
      sales: {
        Row: {
          coupon_code: string | null;
          created_at: string | null;
          customer_id: string;
          discount_amount: number | null;
          gst_amount: number | null;
          gst_enabled: boolean | null;
          id: string;
          sale_date: string | null;
          status: string | null;
          subtotal: number;
          total_amount: number;
          updated_at: string | null;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string | null;
          customer_id: string;
          discount_amount?: number | null;
          gst_amount?: number | null;
          gst_enabled?: boolean | null;
          id?: string;
          sale_date?: string | null;
          status?: string | null;
          subtotal?: number;
          total_amount?: number;
          updated_at?: string | null;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string | null;
          customer_id?: string;
          discount_amount?: number | null;
          gst_amount?: number | null;
          gst_enabled?: boolean | null;
          id?: string;
          sale_date?: string | null;
          status?: string | null;
          subtotal?: number;
          total_amount?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      screen_permissions: {
        Row: {
          created_at: string | null;
          enabled: boolean | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          screen_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          screen_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          screen_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          contact_person: string | null;
          created_at: string;
          email: string | null;
          id: string;
          license_number: string | null;
          phone: string | null;
          supplier_id: string;
          supplier_name: string;
          updated_at: string;
        };
        Insert: {
          contact_person?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          license_number?: string | null;
          phone?: string | null;
          supplier_id: string;
          supplier_name: string;
          updated_at?: string;
        };
        Update: {
          contact_person?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          license_number?: string | null;
          phone?: string | null;
          supplier_id?: string;
          supplier_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      template_field_mappings: {
        Row: {
          created_at: string;
          field_name: string;
          field_type: string;
          font_size: number | null;
          height: number | null;
          id: string;
          page_number: number;
          template_id: string;
          updated_at: string;
          width: number | null;
          x_position: number;
          y_position: number;
        };
        Insert: {
          created_at?: string;
          field_name: string;
          field_type: string;
          font_size?: number | null;
          height?: number | null;
          id?: string;
          page_number?: number;
          template_id: string;
          updated_at?: string;
          width?: number | null;
          x_position: number;
          y_position: number;
        };
        Update: {
          created_at?: string;
          field_name?: string;
          field_type?: string;
          font_size?: number | null;
          height?: number | null;
          id?: string;
          page_number?: number;
          template_id?: string;
          updated_at?: string;
          width?: number | null;
          x_position?: number;
          y_position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "template_field_mappings_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          }
        ];
      };
      templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          file_name: string;
          file_url: string;
          id: string;
          is_active: boolean;
          name: string;
          template_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          file_name: string;
          file_url: string;
          id?: string;
          is_active?: boolean;
          name: string;
          template_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          file_name?: string;
          file_url?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          template_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_screen: {
        Args: { _screen_id: string; _user_id: string };
        Returns: boolean;
      };
      enable_strict_security: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      generate_employee_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_medicine_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_supplier_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "pharmacist"
        | "hr";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "hr",
      ],
    },
  },
} as const;
