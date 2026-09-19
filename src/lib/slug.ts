/**
 * A painting's address from its title: "Dog & Bug Amusement" →
 * "dog-and-bug-amusement". Readable, no random suffix — a collision is
 * resolved with a meaningful qualifier by the caller, never a hash.
 */
export function slugify(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "artwork"
  );
}
