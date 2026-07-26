import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Brak parametru 'key'." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore("kokon-kv");

  try {
    if (req.method === "GET") {
      const value = await store.get(key);
      return new Response(JSON.stringify({ key, value: value ?? null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      await store.set(key, body.value);
      return new Response(JSON.stringify({ key, value: body.value, shared: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      await store.delete(key);
      return new Response(JSON.stringify({ key, deleted: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};

export const config = { path: "/.netlify/functions/kv" };
