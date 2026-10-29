import type { MetadataRoute } from "next";
import { origemDoSite, regrasDeRobots } from "@/lib/seo.mjs";

export default function robots(): MetadataRoute.Robots {
  return regrasDeRobots(origemDoSite(process.env));
}
