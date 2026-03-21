const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const DUPLICATE_SEPARATOR_REGEX = /-{2,}/g;
const EDGE_SEPARATOR_REGEX = /^-|-$/g;

export function slugifyOrganizationName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(DUPLICATE_SEPARATOR_REGEX, "-")
    .replace(EDGE_SEPARATOR_REGEX, "");

  const slug = normalized.slice(0, 48);

  if (!slug) {
    return "organization";
  }

  return slug;
}

export function appendSlugSuffix(baseSlug: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${baseSlug}-${suffix}`;
}
