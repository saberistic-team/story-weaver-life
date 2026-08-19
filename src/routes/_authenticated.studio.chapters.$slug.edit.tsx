import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { updateChapterFn, getStudioChapter } from "@/lib/studio.functions";
import { toast } from "sonner";

const chapterQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["chapter", slug, "studio"],
    queryFn: () => getStudioChapter({ data: { slug } }),
  });

export const Route = createFileRoute("/_authenticated/studio/chapters/$slug/edit")({
  head: () => ({
    meta: [
      { title: "Edit Chapter — StoryPass Studio" },
      { name: "description", content: "Edit chapter content, metadata, and canon status." },
      { property: "og:title", content: "Edit Chapter — StoryPass Studio" },
      { property: "og:description", content: "Edit chapter content, metadata, and canon status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(chapterQueryOptions(params.slug)),
  component: EditChapterPage,
});

function EditChapterPage() {
  const { slug } = Route.useParams();
  const { data: chapter } = useSuspenseQuery(chapterQueryOptions(slug));
  const updateChapter = useServerFn(updateChapterFn);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(chapter.title ?? "");
  const [subtitle, setSubtitle] = useState(chapter.subtitle ?? "");
  const [summary, setSummary] = useState(chapter.summary ?? "");
  const [content, setContent] = useState(chapter.published_content ?? chapter.raw_content ?? "");
  const [status, setStatus] = useState(chapter.status ?? "published");
  const [isCanon, setIsCanon] = useState(chapter.is_canon ?? true);
  const [isPublished, setIsPublished] = useState(chapter.is_published ?? false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateChapter({
        data: {
          chapterId: chapter.id,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          summary: summary.trim(),
          published_content: content.trim(),
          status,
          is_canon: isCanon,
          is_published: isPublished,
        },
      });
      toast.success("Chapter updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/studio">
            <ArrowLeft className="mr-2 size-4" />
            Studio
          </Link>
        </Button>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">{chapter.title}</h1>
            <p className="mt-1 text-muted-foreground">Edit chapter content and publishing state.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/chapters/$slug" params={{ slug }}>
                {isPublished ? (
                  <>
                    <Eye className="mr-2 size-4" /> View live
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 size-4" /> Preview
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={onSave} className="mt-8 space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Published content</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={16} required />
                <p className="text-xs text-muted-foreground">{content.length.toLocaleString()} characters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="under_review">Under review</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center justify-between gap-4">
                  <Label htmlFor="canon" className="cursor-pointer">
                    Canon chapter
                  </Label>
                  <Switch id="canon" checked={isCanon} onCheckedChange={setIsCanon} />
                </div>
                <div className="flex flex-1 items-center justify-between gap-4">
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                  </Label>
                  <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">{chapter.read_count.toLocaleString()} reads</Badge>
                <Badge variant="outline">{chapter.like_count.toLocaleString()} likes</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 size-4" />
              {loading ? "Saving..." : "Save chapter"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
