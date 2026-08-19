import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";

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
import { architectStoryFn, createGameFn } from "@/lib/play.functions";

const GENRES = ["Science Fiction", "Fantasy", "Mystery", "Horror", "Literary", "Romance", "Adventure"];

export const Route = createFileRoute("/_authenticated/play/new")({
  head: () => ({
    meta: [
      { title: "Start a story game — StoryWeaver" },
      { name: "description", content: "Set a premise, pick the rules, and invite players to write with you." },
      { property: "og:title", content: "Start a story game — StoryWeaver" },
      { property: "og:description", content: "Set the premise. The table writes the rest." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewGame,
});

function NewGame() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [premise, setPremise] = useState("");
  const [genre, setGenre] = useState("Science Fiction");
  const [rounds, setRounds] = useState(6);
  const [turnSeconds, setTurnSeconds] = useState(120);
  const [maxChars, setMaxChars] = useState(400);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [visibility, setVisibility] = useState<"blind" | "contextual" | "open">("contextual");
  const [polishStyle, setPolishStyle] = useState<"light" | "balanced" | "cinematic" | "disabled">("balanced");
  const [aiGm, setAiGm] = useState(true);
  const [busy, setBusy] = useState(false);
  const [idea, setIdea] = useState("");
  const [thinking, setThinking] = useState(false);

  async function architect() {
    if (idea.trim().length < 8) {
      toast.error("Give the architect a sentence to work with.");
      return;
    }
    setThinking(true);
    try {
      const result = await architectStoryFn({ data: { idea } });
      if (result?.title) setTitle(result.title);
      if (result?.premise) setPremise(result.premise);
      if (result?.genre && GENRES.includes(result.genre)) setGenre(result.genre);
      toast.success("The Story Architect drafted a premise.");
    } catch {
      toast.error("The architect is unavailable — write your own premise for now.");
    } finally {
      setThinking(false);
    }
  }

  async function create() {
    setBusy(true);
    try {
      const game = await createGameFn({
        data: {
          title,
          premise,
          genre,
          rounds,
          turnSeconds,
          maxChars,
          maxPlayers,
          visibility,
          aiGm,
          polishStyle,
        },
      });
      void navigate({ to: "/play/$id", params: { id: game.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the game");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight">Start a story</h1>
        <p className="mt-2 text-muted-foreground">
          Set the premise and the rules. Players take timed turns; AI polishes and stitches the chapter.
        </p>

        <div className="mt-8 rounded-xl border border-primary/40 bg-card p-4">
          <div className="flex items-center gap-2 text-primary">
            <Wand2 className="size-4" />
            <span className="text-xs tracking-widest uppercase">Story Architect</span>
          </div>
          <Textarea
            className="mt-3"
            placeholder="A lighthouse keeper starts receiving letters postmarked next year…"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
          <Button variant="outline" size="sm" className="mt-3" disabled={thinking} onClick={() => void architect()}>
            {thinking ? "Drafting…" : "Draft a premise"}
          </Button>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className="mt-1.5"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="premise">Premise</Label>
            <Textarea
              id="premise"
              className="mt-1.5 min-h-28"
              value={premise}
              maxLength={800}
              onChange={(e) => setPremise(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Context players see</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blind">Blind — premise only</SelectItem>
                  <SelectItem value="contextual">Contextual — last turn</SelectItem>
                  <SelectItem value="open">Open — whole story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rounds">Turns</Label>
              <Input
                id="rounds"
                type="number"
                min={2}
                max={24}
                className="mt-1.5"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds per turn</Label>
              <Input
                id="seconds"
                type="number"
                min={30}
                max={600}
                step={10}
                className="mt-1.5"
                value={turnSeconds}
                onChange={(e) => setTurnSeconds(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="chars">Characters per turn</Label>
              <Input
                id="chars"
                type="number"
                min={120}
                max={1200}
                step={20}
                className="mt-1.5"
                value={maxChars}
                onChange={(e) => setMaxChars(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="players">Max players</Label>
              <Input
                id="players"
                type="number"
                min={2}
                max={12}
                className="mt-1.5"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>AI polish</Label>
              <Select value={polishStyle} onValueChange={(v) => setPolishStyle(v as typeof polishStyle)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light touch</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="disabled">Keep it raw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>AI Game Master</Label>
              <Select value={aiGm ? "on" : "off"} onValueChange={(v) => setAiGm(v === "on")}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On — throw twists</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={busy || title.trim().length < 3 || premise.trim().length < 20}
            onClick={() => void create()}
          >
            Create game & open the lobby
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
