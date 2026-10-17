export function canShareCamp(user: { id: string } | null | undefined) {
  return Boolean(user?.id);
}

export function campShareUrl(campId: string, zip: string) {
  const url = new URL("/camps", "https://kodanzcamp.lovable.app");
  url.searchParams.set("zip", zip);
  url.searchParams.set("camp", campId);
  return url.href;
}