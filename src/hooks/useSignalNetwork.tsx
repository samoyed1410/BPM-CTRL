import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SignalIdentity {
  id: string;
  alias: string;
  xp: number;
  join_count: number;
  created_at: string;
  updated_at: string;
}

const fetchSignalLeaderboard = async (): Promise<SignalIdentity[]> => {
  const client = supabase as any;
  const { data, error } = await client
    .from("signal_identities")
    .select("id, alias, xp, join_count, created_at, updated_at")
    .order("xp", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data || []) as SignalIdentity[];
};

export const useSignalLeaderboard = () => {
  return useQuery({
    queryKey: ["signal-leaderboard"],
    queryFn: fetchSignalLeaderboard,
    refetchInterval: 15000,
  });
};

export const useSubmitSignalAlias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alias: string) => {
      const client = supabase as any;
      const { data, error } = await client.rpc("submit_signal_alias", { p_alias: alias });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result) {
        throw new Error("Unable to submit alias right now. Please try again.");
      }

      return result as SignalIdentity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-leaderboard"] });
    },
  });
};
