import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Called by the API after something public changes (an author saves their
// profile, an article is published or archived) so the next visitor sees it
// straight away instead of within a minute. Needs the shared REVALIDATE_SECRET;
// without it the endpoint is off and the site simply refreshes every minute.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const given = request.headers.get("x-revalidate-secret") ?? "";
  const ok = secret.length >= 16 && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ message: "Not allowed." }, { status: 401 });
  // expire: 0 — the next request gets fresh data rather than a stale copy.
  revalidateTag("blog", { expire: 0 });
  return Response.json({ revalidated: true });
}
