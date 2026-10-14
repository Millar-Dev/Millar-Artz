/**
 * The video id out of whatever YouTube link was pasted — a watch link, a
 * youtu.be short link, a Shorts link or an embed link. Anything else gives
 * null, so a mistyped link shows no player rather than a broken frame.
 */
export function youtubeId(url: string | null | undefined) {
  const value = (url ?? "").trim();
  if (!value) return null;
  const patterns = [
    /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:.*&)?v=([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:embed|shorts|live|v)\/([\w-]{11})/i,
  ];
  for (const re of patterns) {
    const m = value.match(re);
    if (m) return m[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : null;
}

/** Privacy-friendly embed URL: youtube-nocookie sets no tracking cookie until
 *  the visitor actually plays the video. */
export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
