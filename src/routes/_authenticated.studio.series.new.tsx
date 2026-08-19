import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useServerFn } from "@tanstack/react-start";
import { createSeriesFn } from "@/lib/studio.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/studio/series/new")({
  head: () => ({
    meta: [
      { title: "New Series — StoryWeaver Studio" },
      { name: "description", content: "Create a new series universe on StoryWeaver." },
      { property: "og:title", content: "New Series — StoryWeaver Studio" },
      { property: "og:description", content: "Create a new series universe on StoryWeaver." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewSeriesPage,
});

function NewSeriesPage() {
  const navigate = useNavigate();
  const createSeries = useServerFn(createSeriesFn);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Sci-Fi");
  const [voice, setVoice] = useState("");
  const [canonMode, setCanonMode] = useState<"creator" | "collaborative" | "chaos">(
    "collaborative",
  );
  const [polishStyle, setPolishStyle] = useState<"light" | "balanced" | "cinematic" | "disabled">(
    "balanced",
  );
  const [isPublic, setIsPublic] = useState(true);
  const [allowForks, setAllowForks] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      const result = await createSeries({
        data: {
          title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim(),
          genre,
          voice: voice.trim() || undefined,
          canon_mode: canonMode,
          polish_style: polishStyle,
          is_public: isPublic,
          allow_forks: allowForks,
        },
      });
      toast.success("Series created");
      navigate({ to: "/studio/series/$slug/edit", params: { slug: result.slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create series");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/studio">
            <ArrowLeft className="mr-2 size-4" />
            Back to studio
          </Link>
        </Button>

        <h1 className="mt-6 font-display text-3xl tracking-tight">Create a new series</h1>
        <p className="mt-2 text-muted-foreground">
          Define the world, canon rules, and voice for your universe.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Last Train"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One carriage. Forty strangers. No destination."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What is this series about?"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="Atmospheric, cinematic"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Canon mode</Label>
              <Select value={canonMode} onValueChange={(v) => setCanonMode(v as typeof canonMode)}>
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

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <Label htmlFor="public" className="cursor-pointer">
                Public series
              </Label>
              <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <Label htmlFor="forks" className="cursor-pointer">
                Allow forks
              </Label>
              <Switch id="forks" checked={allowForks} onCheckedChange={setAllowForks} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !title.trim() || !description.trim()}>
              {loading ? "Creating..." : "Create series"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/studio">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
