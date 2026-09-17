import { Facebook, Instagram, Youtube } from "lucide-react";
import type { SocialKey } from "@/lib/social";

/**
 * TikTok's note, drawn in Lucide's outline style — 24px grid, 2px round
 * stroke — so it sits beside the Instagram, Facebook and YouTube icons at the
 * same weight. Lucide doesn't ship one.
 */
function TikTok({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1.3V15a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V3z" />
    </svg>
  );
}

const ICONS: Record<SocialKey, (p: { size?: number }) => React.ReactNode> = {
  instagram_url: Instagram,
  facebook_url: Facebook,
  tiktok_url: TikTok,
  youtube_url: Youtube,
};

export function SocialIcon({ platform, size }: { platform: SocialKey; size?: number }) {
  const Icon = ICONS[platform];
  return <Icon size={size} />;
}
