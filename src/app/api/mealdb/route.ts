// Proxy hacia TheMealDB (gratis, sin clave) para buscar recetas en internet.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const id = url.searchParams.get("id")?.trim();
  const ing = url.searchParams.get("i")?.trim();
  let api: string;
  if (id) api = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
  else if (ing) api = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`;
  else if (q) api = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;
  else return Response.json({ meals: [] });
  try {
    const r = await fetch(api);
    const data = await r.json();
    return Response.json(data);
  } catch {
    return Response.json({ meals: null, error: "No se pudo conectar con TheMealDB" }, { status: 502 });
  }
}
