import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type SiteAsset = Tables<"site_assets">;

export const useSiteAssets = (section?: string) => {
  return useQuery({
    queryKey: ["site-assets", section],
    queryFn: async () => {
      let query = supabase
        .from("site_assets")
        .select("*")
        .order("sort_order", { ascending: true });
      if (section) query = query.eq("section", section);
      const { data, error } = await query;
      if (error) throw error;
      return data as SiteAsset[];
    },
  });
};

export const useAllSiteAssets = () => {
  return useQuery({
    queryKey: ["site-assets-all"],
    queryFn: async () => {
      // Admin query - gets all including inactive
      const { data, error } = await supabase
        .from("site_assets")
        .select("*")
        .order("section")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SiteAsset[];
    },
  });
};

export const useCreateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: TablesInsert<"site_assets">) => {
      const { data, error } = await supabase
        .from("site_assets")
        .insert(asset)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-assets"] });
      qc.invalidateQueries({ queryKey: ["site-assets-all"] });
    },
  });
};

export const useUpdateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"site_assets"> & { id: string }) => {
      const { data, error } = await supabase
        .from("site_assets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-assets"] });
      qc.invalidateQueries({ queryKey: ["site-assets-all"] });
    },
  });
};

export const useDeleteAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-assets"] });
      qc.invalidateQueries({ queryKey: ["site-assets-all"] });
    },
  });
};

export const uploadAssetFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("site-assets")
    .getPublicUrl(data.path);
  return { storagePath: data.path, publicUrl: urlData.publicUrl };
};
