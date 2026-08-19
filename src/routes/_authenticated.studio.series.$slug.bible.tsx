import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen, Plus, Save, Trash2 } from "lucide-react";

import { PageShell } from "@/components/site-shell";
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
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import {
  getStudioSeries,
  getStudioBible,
  createBibleEntryFn,
  updateBibleEntryFn,
} from "@/lib/studio.functions";
import { toast } from "sonner";

const seriesQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["studio", "series", slug],
    queryFn: () => getStudioSeries({ data: { slug } }),
  });

const bibleQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["studio", "series", seriesId, "bible"],
    queryFn: () => getStudioBible({ data: { seriesId } }),
  });

const KINDS = ["character", "location", "item", "lore", "event", "faction"];

export const Route = createFileRoute("/_authenticated/studio/series/$slug/bible")({
  head: () => ({
    meta: [
      { title: "Story Bible — StoryWeaver Studio" },
      { name: "description", content: "Edit Story Bible entries for your series." },
      { property: "og:title", content: "Story Bible — StoryWeaver Studio" },
      { property: "og:description", content: "Edit Story Bible entries for your series." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(seriesQueryOptions(params.slug)),
  component: BiblePage,
});

function BiblePage() {
  const { slug } = Route.useParams();
  const { data: series } = useSuspenseQuery(seriesQueryOptions(slug));
  const { data: entries, refetch } = useSuspenseQuery(bibleQueryOptions(series!.id));
  const createEntry = useServerFn(createBibleEntryFn);
  const updateEntry = useServerFn(updateBibleEntryFn);
  const [loading, setLoading] = useState(false);

  const [newKind, setNewKind] = useState("character");
  const [newName, setNewName] = useState("");
  const [newBody, setNewBody] = useState("");

  if (!series) {
    return (
      <PageShell>
        <p>Series not found.</p>
      </PageShell>
    );
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBody.trim()) return;
    setLoading(true);
    try {
      await createEntry({
        data: {
          seriesId: series.id,
          kind: newKind,
          name: newName.trim(),
          body: newBody.trim(),
        },
      });
      toast.success("Entry added");
      setNewName("");
      setNewBody("");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (
    entryId: string,
    patch: { name?: string; body?: string; state?: "draft" | "canon" | "deprecated" | "spoiler" },
  ) => {
    try {
      await updateEntry({ data: { entryId, ...patch } });
      toast.success("Entry updated");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update entry");
    }
  };

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const k = entry.kind;
    if (!acc[k]) acc[k] = [];
    acc[k].push(entry);
    return acc;
  }, {});

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
            <h1 className="font-display text-3xl tracking-tight">Story Bible</h1>
            <p className="mt-1 text-muted-foreground">
              Manage characters, locations, and lore for{" "}
              <span className="text-foreground">{series.title}</span>.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/studio/series/$slug/edit" params={{ slug }}>
              Series settings
            </Link>
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Plus className="size-5 text-primary" />
              New entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kind</Label>
                  <Select value={newKind} onValueChange={(v) => setNewKind(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KINDS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Elara Voss"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  placeholder="Who or what is this?"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !newName.trim() || !newBody.trim()}>
                Add entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          {KINDS.filter((k) => grouped[k]?.length).map((kind) => (
            <section key={kind}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-xl capitalize">
                <BookOpen className="size-5 text-primary" />
                {kind}s
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(grouped[kind] ?? []).map((entry) => (
                  <EditableEntry key={entry.id} entry={entry} onUpdate={onUpdate} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function EditableEntry({
  entry,
  onUpdate,
}: {
  entry: {
    id: string;
    name: string;
    body: string;
    state: "draft" | "canon" | "deprecated" | "spoiler";
  };
  onUpdate: (
    id: string,
    patch: { name?: string; body?: string; state?: "draft" | "canon" | "deprecated" | "spoiler" },
  ) => void;
}) {
  const [name, setName] = useState(entry.name);
  const [body, setBody] = useState(entry.body);
  const [state, setState] = useState(entry.state);

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        <div className="flex items-center justify-between gap-2">
          <Select value={state} onValueChange={(v) => setState(v as typeof state)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="canon">Canon</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
              <SelectItem value="spoiler">Spoiler</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => onUpdate(entry.id, { name, body, state })}
            disabled={name === entry.name && body === entry.body && state === entry.state}
          >
            <Save className="mr-2 size-4" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
