// libs/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shopposts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          name: string | null;
          url: string;
          jan: number | null;
          content: string | null;
          tag: string | null;
          stock: number | null;
          price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          name?: string | null;
          url: string;
          jan?: number | null;
          content?: string | null;
          tag?: string | null;
          stock?: number | null;
          price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          name?: string | null;
          url?: string;
          jan?: number | null;
          content?: string | null;
          tag?: string | null;
          stock?: number | null;
          price?: number | null;
          created_at?: string;
        };
      };
      // 他に使うテーブルがあれば同様に追記
    };
    Views: Record<string, never>;
    Functions: Record<string, { Args: any; Returns: any }>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
