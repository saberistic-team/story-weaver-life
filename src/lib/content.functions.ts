import { createServerFn } from "@tanstack/react-start";
import {
  fetchBook,
  fetchChapter,
  fetchConfig,
  fetchCreator,
  fetchDiscover,
  fetchGame,
  fetchLanding,
  fetchPlayableGames,
  fetchSeries,
  searchLibrary,
} from "./content.server";

export const getLanding = createServerFn({ method: "GET" }).handler(async () => fetchLanding());

export const getConfig = createServerFn({ method: "GET" }).handler(async () => fetchConfig());

export const getDiscover = createServerFn({ method: "GET" })
  .inputValidator((data: { genre?: string; sort?: string }) => data ?? {})
  .handler(async ({ data }) => fetchDiscover(data.genre, data.sort));

export const getSeries = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => fetchSeries(data.slug));

export const getBook = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => fetchBook(data.slug));

export const getChapter = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => fetchChapter(data.slug));

export const getCreator = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => fetchCreator(data.username));

export const getPlayableGames = createServerFn({ method: "GET" }).handler(async () =>
  fetchPlayableGames(),
);

export const getGame = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchGame(data.id));

export const search = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => searchLibrary(data.q));
