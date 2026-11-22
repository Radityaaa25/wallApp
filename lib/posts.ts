export type Post = {
  id: string;
  author_name: string;
  message: string;
  image_url: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: {
          id?: string;
          author_name?: string;
          message: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          message?: string;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
