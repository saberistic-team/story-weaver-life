import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const url = process.env["VITE_SUPABASE_URL"];
const key = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
const origin = "https://story-weaver-life.lovable.app";

if (!url || !key) {
  console.warn("Supabase env vars missing; writing fallback SEO files.");
  writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  writeFileSync(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n  <url><loc>${origin}/discover</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n  <url><loc>${origin}/pricing</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n</urlset>\n`,
  );
  process.exit(0);
}

const db = createClient(url, key);

async function main() {
  const [{ data: series }, { data: chapters }, { data: creators }] = await Promise.all([
    db.from("series").select("slug, updated_at").eq("is_public", true).eq("status", "published"),
    db.from("chapters").select("slug, updated_at").eq("status", "published"),
    db.from("profiles").select("username, updated_at"),
  ]);

  const urls = [
    { loc: `${origin}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${origin}/discover`, changefreq: "daily", priority: "0.9" },
    { loc: `${origin}/pricing`, changefreq: "weekly", priority: "0.8" },
    ...(series ?? []).map((s) => ({
      loc: `${origin}/series/${s.slug}`,
      lastmod: s.updated_at ? new Date(s.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly" as const,
      priority: "0.8" as const,
    })),
    ...(chapters ?? []).map((c) => ({
      loc: `${origin}/chapters/${c.slug}`,
      lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly" as const,
      priority: "0.7" as const,
    })),
    ...(creators ?? []).map((p) => ({
      loc: `${origin}/creators/${p.username}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly" as const,
      priority: "0.6" as const,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  writeFileSync("public/sitemap.xml", xml);
  writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  console.log(`Wrote public/sitemap.xml with ${urls.length} URLs and public/robots.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
