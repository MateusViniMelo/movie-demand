import type { MetadataRoute } from "next";
import { origemDoSite, urlsDoSitemap } from "@/lib/seo.mjs";

export default function sitemap(): MetadataRoute.Sitemap {
  return urlsDoSitemap(origemDoSite(process.env));
}
