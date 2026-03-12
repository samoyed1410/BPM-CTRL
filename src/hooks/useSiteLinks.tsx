import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

export const useSiteLinks = () => {
  const { data: content, isLoading } = useSectionContent("links");

  return {
    isLoading,
    instagram: getContentValue(content, "instagram_url", "https://instagram.com"),
    twitter: getContentValue(content, "twitter_url", "https://twitter.com"),
    tiktok: getContentValue(content, "tiktok_url", "https://tiktok.com"),
    accessTicket: getContentValue(content, "access_ticket_url", "#event"),
  };
};
