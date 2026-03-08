import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContent {
  id: string;
  section: string;
  content_key: string;
  content_value: string;
  content_type: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const fetchSectionContent = async (section: string): Promise<SiteContent[]> => {
  const { data, error } = await supabase
    .from("site_content" as any)
    .select("*")
    .eq("section", section)
    .order("sort_order");
  if (error) throw error;
  return (data as any) || [];
};

const fetchAllContent = async (): Promise<SiteContent[]> => {
  const { data, error } = await supabase
    .from("site_content" as any)
    .select("*")
    .order("section")
    .order("sort_order");
  if (error) throw error;
  return (data as any) || [];
};

export const useSectionContent = (section: string) => {
  return useQuery({
    queryKey: ["site_content", section],
    queryFn: () => fetchSectionContent(section),
  });
};

export const useAllSiteContent = () => {
  return useQuery({
    queryKey: ["site_content"],
    queryFn: fetchAllContent,
  });
};

/** Helper: get a single value from a content array by key */
export const getContentValue = (
  content: SiteContent[] | undefined,
  key: string,
  fallback = ""
): string => {
  return content?.find((c) => c.content_key === key)?.content_value ?? fallback;
};

/** Helper: get parsed JSON from content array by key */
export const getContentJSON = <T = any>(
  content: SiteContent[] | undefined,
  key: string,
  fallback: T[] = []
): T[] => {
  const raw = content?.find((c) => c.content_key === key)?.content_value;
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const useUpdateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<SiteContent> & { id: string }) => {
      const { id, ...updates } = item;
      const { error } = await supabase
        .from("site_content" as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_content"] }),
  });
};

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<SiteContent, "id" | "created_at" | "updated_at" | "is_active">) => {
      const { error } = await supabase
        .from("site_content" as any)
        .insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_content"] }),
  });
};

export const useDeleteContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_content" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_content"] }),
  });
};
