import { NextResponse } from "next/server";

const OMDB_KEY = "c01a3bca";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ poster: null });
  }

  const clean = title.replace(/\([^)]*\)/g, "").trim();

  // 1. Fuzzy search
  let url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(clean)}`;
  let res = await fetch(url);
  let data = await res.json();

  let poster = null;

  if (data.Search && data.Search.length > 0 && data.Search[0].Poster !== "N/A") {
    poster = data.Search[0].Poster;
  }

  // 2. Exact search fallback
  if (!poster) {
    url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(clean)}`;
    res = await fetch(url);
    data = await res.json();
    if (data.Poster && data.Poster !== "N/A") {
      poster = data.Poster;
    }
  }

  // 3. Final fallback
  if (!poster) {
    poster = "https://via.placeholder.com/120x180?text=No+Image";
  }

  return NextResponse.json({ poster });
}