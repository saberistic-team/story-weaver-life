export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string;
          description: string;
          icon: string;
          name: string;
          story_points: number;
        };
        Insert: {
          code: string;
          description: string;
          icon?: string;
          name: string;
          story_points?: number;
        };
        Update: {
          code?: string;
          description?: string;
          icon?: string;
          name?: string;
          story_points?: number;
        };
        Relationships: [];
      };
      ai_jobs: {
        Row: {
          created_at: string;
          error: string | null;
          feature: string;
          id: string;
          model: string | null;
          provider: string;
          result_meta: Json;
          status: Database["public"]["Enums"]["ai_job_status"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          feature: string;
          id?: string;
          model?: string | null;
          provider?: string;
          result_meta?: Json;
          status?: Database["public"]["Enums"]["ai_job_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          feature?: string;
          id?: string;
          model?: string | null;
          provider?: string;
          result_meta?: Json;
          status?: Database["public"]["Enums"]["ai_job_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      books: {
        Row: {
          cover_url: string | null;
          created_at: string;
          description: string;
          id: string;
          published_at: string | null;
          sequence: number;
          series_id: string;
          slug: string;
          status: Database["public"]["Enums"]["book_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_url?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          published_at?: string | null;
          sequence?: number;
          series_id: string;
          slug: string;
          status?: Database["public"]["Enums"]["book_status"];
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_url?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          published_at?: string | null;
          sequence?: number;
          series_id?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["book_status"];
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "books_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      chapter_contributors: {
        Row: {
          chapter_id: string;
          contribution_count: number;
          id: string;
          user_id: string;
        };
        Insert: {
          chapter_id: string;
          contribution_count?: number;
          id?: string;
          user_id: string;
        };
        Update: {
          chapter_id?: string;
          contribution_count?: number;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapter_contributors_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
        ];
      };
      chapters: {
        Row: {
          book_id: string | null;
          cover_url: string | null;
          created_at: string;
          forked_from_chapter_id: string | null;
          forked_from_game_id: string | null;
          id: string;
          is_canon: boolean;
          is_published: boolean;
          like_count: number;
          published_at: string | null;
          published_content: string;
          raw_content: string;
          read_count: number;
          sequence: number;
          series_id: string;
          slug: string;
          source_game_id: string | null;
          status: Database["public"]["Enums"]["content_status"];
          subtitle: string | null;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          book_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          forked_from_chapter_id?: string | null;
          forked_from_game_id?: string | null;
          id?: string;
          is_canon?: boolean;
          is_published?: boolean;
          like_count?: number;
          published_at?: string | null;
          published_content?: string;
          raw_content?: string;
          read_count?: number;
          sequence?: number;
          series_id: string;
          slug: string;
          source_game_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          subtitle?: string | null;
          summary?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          book_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          forked_from_chapter_id?: string | null;
          forked_from_game_id?: string | null;
          id?: string;
          is_canon?: boolean;
          is_published?: boolean;
          like_count?: number;
          published_at?: string | null;
          published_content?: string;
          raw_content?: string;
          read_count?: number;
          sequence?: number;
          series_id?: string;
          slug?: string;
          source_game_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          subtitle?: string | null;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chapters_forked_from_chapter_id_fkey";
            columns: ["forked_from_chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chapters_forked_from_game_id_fkey";
            columns: ["forked_from_game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chapters_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chapters_source_game_id_fkey";
            columns: ["source_game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["content_status"];
          target_id: string;
          target_type: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["content_status"];
          target_id: string;
          target_type: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["content_status"];
          target_id?: string;
          target_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      contribution_polish_versions: {
        Row: {
          contribution_id: string;
          created_at: string;
          id: string;
          is_current: boolean;
          model: string | null;
          polished_text: string;
          style: Database["public"]["Enums"]["polish_style"];
        };
        Insert: {
          contribution_id: string;
          created_at?: string;
          id?: string;
          is_current?: boolean;
          model?: string | null;
          polished_text: string;
          style?: Database["public"]["Enums"]["polish_style"];
        };
        Update: {
          contribution_id?: string;
          created_at?: string;
          id?: string;
          is_current?: boolean;
          model?: string | null;
          polished_text?: string;
          style?: Database["public"]["Enums"]["polish_style"];
        };
        Relationships: [
          {
            foreignKeyName: "contribution_polish_versions_contribution_id_fkey";
            columns: ["contribution_id"];
            isOneToOne: false;
            referencedRelation: "contributions";
            referencedColumns: ["id"];
          },
        ];
      };
      contributions: {
        Row: {
          author_id: string;
          canon_status: Database["public"]["Enums"]["canon_status"];
          chapter_id: string | null;
          char_count: number;
          created_at: string;
          game_id: string;
          id: string;
          original_text: string;
          position: number;
          status: Database["public"]["Enums"]["content_status"];
          turn_id: string | null;
        };
        Insert: {
          author_id: string;
          canon_status?: Database["public"]["Enums"]["canon_status"];
          chapter_id?: string | null;
          char_count?: number;
          created_at?: string;
          game_id: string;
          id?: string;
          original_text: string;
          position?: number;
          status?: Database["public"]["Enums"]["content_status"];
          turn_id?: string | null;
        };
        Update: {
          author_id?: string;
          canon_status?: Database["public"]["Enums"]["canon_status"];
          chapter_id?: string | null;
          char_count?: number;
          created_at?: string;
          game_id?: string;
          id?: string;
          original_text?: string;
          position?: number;
          status?: Database["public"]["Enums"]["content_status"];
          turn_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contributions_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributions_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributions_turn_id_fkey";
            columns: ["turn_id"];
            isOneToOne: false;
            referencedRelation: "game_turns";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_earnings: {
        Row: {
          amount_cents: number;
          created_at: string;
          creator_id: string;
          environment: string;
          id: string;
          paddle_subscription_id: string | null;
          paddle_transaction_id: string | null;
          period: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount_cents?: number;
          created_at?: string;
          creator_id: string;
          environment?: string;
          id?: string;
          paddle_subscription_id?: string | null;
          paddle_transaction_id?: string | null;
          period: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          creator_id?: string;
          environment?: string;
          id?: string;
          paddle_subscription_id?: string | null;
          paddle_transaction_id?: string | null;
          period?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          id: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          id?: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          id?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [];
      };
      game_challenges: {
        Row: {
          created_at: string;
          game_id: string;
          id: string;
          kind: string;
          reward_sparks: number;
          round: number;
          text: string;
        };
        Insert: {
          created_at?: string;
          game_id: string;
          id?: string;
          kind?: string;
          reward_sparks?: number;
          round?: number;
          text: string;
        };
        Update: {
          created_at?: string;
          game_id?: string;
          id?: string;
          kind?: string;
          reward_sparks?: number;
          round?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_challenges_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      game_events: {
        Row: {
          created_at: string;
          game_id: string;
          id: string;
          kind: string;
          payload: Json;
        };
        Insert: {
          created_at?: string;
          game_id: string;
          id?: string;
          kind: string;
          payload?: Json;
        };
        Update: {
          created_at?: string;
          game_id?: string;
          id?: string;
          kind?: string;
          payload?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      game_players: {
        Row: {
          game_id: string;
          id: string;
          is_host: boolean;
          joined_at: string;
          seat_order: number;
          user_id: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          is_host?: boolean;
          joined_at?: string;
          seat_order: number;
          user_id: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          is_host?: boolean;
          joined_at?: string;
          seat_order?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      game_turns: {
        Row: {
          challenge_id: string | null;
          created_at: string;
          ends_at: string | null;
          game_id: string;
          id: string;
          player_id: string | null;
          round: number;
          starts_at: string | null;
          status: Database["public"]["Enums"]["turn_status"];
          submitted_at: string | null;
          turn_index: number;
        };
        Insert: {
          challenge_id?: string | null;
          created_at?: string;
          ends_at?: string | null;
          game_id: string;
          id?: string;
          player_id?: string | null;
          round: number;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["turn_status"];
          submitted_at?: string | null;
          turn_index: number;
        };
        Update: {
          challenge_id?: string | null;
          created_at?: string;
          ends_at?: string | null;
          game_id?: string;
          id?: string;
          player_id?: string | null;
          round?: number;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["turn_status"];
          submitted_at?: string | null;
          turn_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_turns_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "game_challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_turns_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          ai_gm_enabled: boolean;
          audience_voting: boolean;
          book_id: string | null;
          canon_mode: Database["public"]["Enums"]["canon_mode"];
          challenge_frequency: number;
          chapter_sequence: number | null;
          completed_at: string | null;
          cover_url: string | null;
          created_at: string;
          current_round: number;
          forked_from_game_id: string | null;
          genre: string;
          host_id: string;
          id: string;
          invite_only: boolean;
          is_public: boolean;
          max_chars: number;
          max_players: number;
          min_players: number;
          polish_style: Database["public"]["Enums"]["polish_style"];
          premise: string;
          reward_sparks: number;
          rounds: number;
          series_id: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["game_status"];
          title: string;
          turn_seconds: number;
          updated_at: string;
          visibility_mode: Database["public"]["Enums"]["visibility_mode"];
        };
        Insert: {
          ai_gm_enabled?: boolean;
          audience_voting?: boolean;
          book_id?: string | null;
          canon_mode?: Database["public"]["Enums"]["canon_mode"];
          challenge_frequency?: number;
          chapter_sequence?: number | null;
          completed_at?: string | null;
          cover_url?: string | null;
          created_at?: string;
          current_round?: number;
          forked_from_game_id?: string | null;
          genre: string;
          host_id: string;
          id?: string;
          invite_only?: boolean;
          is_public?: boolean;
          max_chars?: number;
          max_players?: number;
          min_players?: number;
          polish_style?: Database["public"]["Enums"]["polish_style"];
          premise: string;
          reward_sparks?: number;
          rounds?: number;
          series_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["game_status"];
          title: string;
          turn_seconds?: number;
          updated_at?: string;
          visibility_mode?: Database["public"]["Enums"]["visibility_mode"];
        };
        Update: {
          ai_gm_enabled?: boolean;
          audience_voting?: boolean;
          book_id?: string | null;
          canon_mode?: Database["public"]["Enums"]["canon_mode"];
          challenge_frequency?: number;
          chapter_sequence?: number | null;
          completed_at?: string | null;
          cover_url?: string | null;
          created_at?: string;
          current_round?: number;
          forked_from_game_id?: string | null;
          genre?: string;
          host_id?: string;
          id?: string;
          invite_only?: boolean;
          is_public?: boolean;
          max_chars?: number;
          max_players?: number;
          min_players?: number;
          polish_style?: Database["public"]["Enums"]["polish_style"];
          premise?: string;
          reward_sparks?: number;
          rounds?: number;
          series_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["game_status"];
          title?: string;
          turn_seconds?: number;
          updated_at?: string;
          visibility_mode?: Database["public"]["Enums"]["visibility_mode"];
        };
        Relationships: [
          {
            foreignKeyName: "games_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_forked_from_game_id_fkey";
            columns: ["forked_from_game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          created_at: string;
          id: string;
          target_id: string;
          target_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          target_id: string;
          target_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          target_id?: string;
          target_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          kind: string;
          link: string | null;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      poll_options: {
        Row: {
          id: string;
          is_chosen: boolean;
          poll_id: string;
          sort_order: number;
          text: string;
          vote_count: number;
        };
        Insert: {
          id?: string;
          is_chosen?: boolean;
          poll_id: string;
          sort_order?: number;
          text: string;
          vote_count?: number;
        };
        Update: {
          id?: string;
          is_chosen?: boolean;
          poll_id?: string;
          sort_order?: number;
          text?: string;
          vote_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_votes: {
        Row: {
          created_at: string;
          id: string;
          option_id: string;
          poll_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          option_id: string;
          poll_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          option_id?: string;
          poll_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      polls: {
        Row: {
          chapter_id: string | null;
          closes_at: string | null;
          created_at: string;
          id: string;
          is_open: boolean;
          question: string;
          series_id: string;
        };
        Insert: {
          chapter_id?: string | null;
          closes_at?: string | null;
          created_at?: string;
          id?: string;
          is_open?: boolean;
          question?: string;
          series_id: string;
        };
        Update: {
          chapter_id?: string | null;
          closes_at?: string | null;
          created_at?: string;
          id?: string;
          is_open?: boolean;
          question?: string;
          series_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "polls_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "polls_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string;
          favorite_genres: string[];
          id: string;
          intents: string[];
          is_creator: boolean;
          last_active_at: string | null;
          level: number;
          onboarded: boolean;
          story_points: number;
          streak_days: number;
          subscription_tier: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          favorite_genres?: string[];
          id: string;
          intents?: string[];
          is_creator?: boolean;
          last_active_at?: string | null;
          level?: number;
          onboarded?: boolean;
          story_points?: number;
          streak_days?: number;
          subscription_tier?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          favorite_genres?: string[];
          id?: string;
          intents?: string[];
          is_creator?: boolean;
          last_active_at?: string | null;
          level?: number;
          onboarded?: boolean;
          story_points?: number;
          streak_days?: number;
          subscription_tier?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          chapter_id: string;
          completed: boolean;
          id: string;
          percent: number;
          series_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          chapter_id: string;
          completed?: boolean;
          id?: string;
          percent?: number;
          series_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          chapter_id?: string;
          completed?: boolean;
          id?: string;
          percent?: number;
          series_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_progress_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reading_progress_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          reason: string;
          reporter_id: string;
          resolved: boolean;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason: string;
          reporter_id: string;
          resolved?: boolean;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string;
          reporter_id?: string;
          resolved?: boolean;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [];
      };
      series: {
        Row: {
          allow_forks: boolean;
          canon_mode: Database["public"]["Enums"]["canon_mode"];
          cover_url: string | null;
          created_at: string;
          creator_id: string;
          description: string;
          follower_count: number;
          genre: string;
          id: string;
          is_public: boolean;
          polish_style: Database["public"]["Enums"]["polish_style"];
          reader_count: number;
          required_tier: string;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          tagline: string | null;
          title: string;
          universe_id: string | null;
          updated_at: string;
          voice: string | null;
        };
        Insert: {
          allow_forks?: boolean;
          canon_mode?: Database["public"]["Enums"]["canon_mode"];
          cover_url?: string | null;
          created_at?: string;
          creator_id: string;
          description?: string;
          follower_count?: number;
          genre: string;
          id?: string;
          is_public?: boolean;
          polish_style?: Database["public"]["Enums"]["polish_style"];
          reader_count?: number;
          required_tier?: string;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          tagline?: string | null;
          title: string;
          universe_id?: string | null;
          updated_at?: string;
          voice?: string | null;
        };
        Update: {
          allow_forks?: boolean;
          canon_mode?: Database["public"]["Enums"]["canon_mode"];
          cover_url?: string | null;
          created_at?: string;
          creator_id?: string;
          description?: string;
          follower_count?: number;
          genre?: string;
          id?: string;
          is_public?: boolean;
          polish_style?: Database["public"]["Enums"]["polish_style"];
          reader_count?: number;
          required_tier?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          tagline?: string | null;
          title?: string;
          universe_id?: string | null;
          updated_at?: string;
          voice?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "series_universe_id_fkey";
            columns: ["universe_id"];
            isOneToOne: false;
            referencedRelation: "universes";
            referencedColumns: ["id"];
          },
        ];
      };
      spark_transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          meta: Json;
          reason: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          meta?: Json;
          reason: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          meta?: Json;
          reason?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      story_bible_entries: {
        Row: {
          approved_by: string | null;
          body: string;
          created_at: string;
          id: string;
          is_approved: boolean;
          kind: string;
          meta: Json;
          name: string;
          series_id: string;
          sort_order: number;
          spoiler_chapter_id: string | null;
          state: Database["public"]["Enums"]["bible_entry_state"];
          updated_at: string;
          visibility: Database["public"]["Enums"]["bible_entry_visibility"];
        };
        Insert: {
          approved_by?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_approved?: boolean;
          kind: string;
          meta?: Json;
          name: string;
          series_id: string;
          sort_order?: number;
          spoiler_chapter_id?: string | null;
          state?: Database["public"]["Enums"]["bible_entry_state"];
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
        };
        Update: {
          approved_by?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_approved?: boolean;
          kind?: string;
          meta?: Json;
          name?: string;
          series_id?: string;
          sort_order?: number;
          spoiler_chapter_id?: string | null;
          state?: Database["public"]["Enums"]["bible_entry_state"];
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "story_bible_entries_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "story_bible_entries_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "story_bible_entries_spoiler_chapter_id_fkey";
            columns: ["spoiler_chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
        ];
      };
      story_point_transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          reason: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          reason: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          reason?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          environment: string;
          id: string;
          paddle_customer_id: string;
          paddle_subscription_id: string;
          price_id: string;
          product_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          environment?: string;
          id?: string;
          paddle_customer_id: string;
          paddle_subscription_id: string;
          price_id: string;
          product_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          environment?: string;
          id?: string;
          paddle_customer_id?: string;
          paddle_subscription_id?: string;
          price_id?: string;
          product_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      universes: {
        Row: {
          created_at: string;
          creator_id: string;
          description: string | null;
          id: string;
          slug: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          description?: string | null;
          id?: string;
          slug: string;
          title: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          description?: string | null;
          id?: string;
          slug?: string;
          title?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          achievement_code: string;
          earned_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          achievement_code: string;
          earned_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          achievement_code?: string;
          earned_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_code_fkey";
            columns: ["achievement_code"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["code"];
          },
        ];
      };
      user_blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          digest_enabled: boolean;
          notify_achievements: boolean;
          notify_follows: boolean;
          notify_reactions: boolean;
          notify_turn: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          digest_enabled?: boolean;
          notify_achievements?: boolean;
          notify_follows?: boolean;
          notify_reactions?: boolean;
          notify_turn?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          digest_enabled?: boolean;
          notify_achievements?: boolean;
          notify_follows?: boolean;
          notify_reactions?: boolean;
          notify_turn?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          sparks: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          sparks?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          sparks?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_notification: {
        Args: {
          _body: string;
          _kind: string;
          _link: string;
          _title: string;
          _user_id: string;
        };
        Returns: undefined;
      };
      game_is_visible: { Args: { _game_id: string }; Returns: boolean };
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string };
        Returns: boolean;
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
      ai_job_status: "queued" | "running" | "succeeded" | "failed";
      app_role: "admin" | "moderator" | "user";
      bible_entry_state: "draft" | "canon" | "deprecated" | "spoiler";
      bible_entry_visibility: "public" | "players_only" | "spoiler_gated";
      book_status: "draft" | "in_progress" | "complete" | "published" | "archived";
      canon_mode: "creator" | "collaborative" | "chaos";
      canon_status: "canon" | "alternate" | "apocryphal" | "draft";
      content_status: "published" | "reported" | "under_review" | "hidden" | "removed";
      game_status:
        | "draft"
        | "waiting"
        | "active"
        | "paused"
        | "processing"
        | "completed"
        | "published"
        | "cancelled";
      polish_style: "light" | "balanced" | "cinematic" | "disabled";
      turn_status: "pending" | "active" | "submitted" | "timed_out" | "skipped" | "cancelled";
      visibility_mode: "blind" | "contextual" | "open";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ai_job_status: ["queued", "running", "succeeded", "failed"],
      app_role: ["admin", "moderator", "user"],
      bible_entry_state: ["draft", "canon", "deprecated", "spoiler"],
      bible_entry_visibility: ["public", "players_only", "spoiler_gated"],
      book_status: ["draft", "in_progress", "complete", "published", "archived"],
      canon_mode: ["creator", "collaborative", "chaos"],
      canon_status: ["canon", "alternate", "apocryphal", "draft"],
      content_status: ["published", "reported", "under_review", "hidden", "removed"],
      game_status: [
        "draft",
        "waiting",
        "active",
        "paused",
        "processing",
        "completed",
        "published",
        "cancelled",
      ],
      polish_style: ["light", "balanced", "cinematic", "disabled"],
      turn_status: ["pending", "active", "submitted", "timed_out", "skipped", "cancelled"],
      visibility_mode: ["blind", "contextual", "open"],
    },
  },
} as const;
