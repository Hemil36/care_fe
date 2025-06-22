export interface Permission {
  meta: Record<string, string>;
  name: string;
  slug: string;
  context: string;
  description: string;
}
