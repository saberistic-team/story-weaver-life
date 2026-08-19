import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen, Save } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { getStudioSeries, getStudioChapters, updateSeriesFn } from "@/lib/studio.functions";
import { toast } from "sonner";

const seriesQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["studio", "series", slug],
    queryFn: () => getStudioSeries({ data: { slug } }),
  });

const chaptersQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["studio", "series", seriesId, "chapters"],
    queryFn: () => getStudioChapters({ data: { seriesId } }),
  });

export const Route = createFileRoute("/_authenticated/studio/series/$slug/edit")({
  head: () => ({
    meta: [
      { title: "Edit Series — StoryWeaver Studio" },
      { name: "description", content: "Edit series metadata, chapters, and Story Bible." },
      { property: "og:title", content: "Edit Series — StoryWeaver Studio" },
      { property: "og:description", content: "Edit series metadata, chapters, and Story Bible." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(seriesQueryOptions(params.slug)),
  component: EditSeriesPage,
});

function EditSeriesPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: series } = useSuspenseQuery(seriesQueryOptions(slug));
  const { data: chapters } = useSuspenseQuery(chaptersQueryOptions(series!.id));
  const updateSeries = useServerFn(updateSeriesFn);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(series!.title);
  const [tagline, setTagline] = useState(series!.tagline ?? "");
  const [description, setDescription] = useState(series!.description);
  const [genre, setGenre] = useState(series!.genre);
  const [voice, setVoice] = useState(series!.voice ?? "");
  const [canonMode, setCanonMode] = useState(series!.canon_mode);
  const [polishStyle, setPolishStyle] = useState(series!.polish_style);
  const [isPublic, setIsPublic] = useState(series!.is_public);
  const [allowForks, setAllowForks] = useState(series!.allow_forks);
  const [requiredTier, setRequiredTier] = useState(series!.required_tier);

  if (!series) {
    return (
      <PageShell>
        <p>Series not found.</p>
      </PageShell>
    );
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSeries({
        data: {
          seriesId: series.id,
          title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim(),
          genre: genre.trim(),
          voice: voice.trim() || undefined,
          canon_mode: canonMode,
          polish_style: polishStyle,
          is_public: isPublic,
          allow_forks: allowForks,
          required_tier: requiredTier,
        },
      });
      toast.success("Series updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/studio">
            <ArrowLeft className="mr-2 size-4" />
            Studio
          </Link>
        </Button>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">{series.title}</h1>
            <p className="mt-1 text-muted-foreground">Edit series metadata and manage chapters.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/studio/series/$slug/bible" params={{ slug }}>
                <BookOpen className="mr-2 size-4" />
                Story Bible
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/series/$slug" params={{ slug }}>
                View public page
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <form onSubmit={onSave} className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice</Label>
                    <Input id="voice" value={voice} onChange={(e) => setVoice(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Rules & monetization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Canon mode</Label>
                    <Select
                      value={canonMode}
                      onValueChange={(v) => setCanonMode(v as typeof canonMode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creator">Creator canon</SelectItem>
                        <SelectItem value="collaborative">Collaborative canon</SelectItem>
                        <SelectItem value="chaos">Chaos canon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Polish style</Label>
                    <Select
                      value={polishStyle}
                      onValueChange={(v) => setPolishStyle(v as typeof polishStyle)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Required tier</Label>
                    <Select value={requiredTier} onValueChange={(v) => setRequiredTier(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="supporter">Supporter</SelectItem>
                        <SelectItem value="patron">Patron</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <Label htmlFor="public" className="cursor-pointer">
                      Public series
                    </Label>
                    <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <Label htmlFor="forks" className="cursor-pointer">
                      Allow forks
                    </Label>
                    <Switch id="forks" checked={allowForks} onCheckedChange={setAllowForks} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 size-4" />
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-display text-lg">Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No chapters yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {chapters.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        <div className="mt-1 flex gap-2">
                          {c.is_published ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Draft
                            </Badge>
                          )}
                          {c.is_canon ? <Badge className="text-[10px]">Canon</Badge> : null}
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0 text-xs"
                      >
                        <Link to="/studio/chapters/$slug/edit" params={{ slug: c.slug }}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
