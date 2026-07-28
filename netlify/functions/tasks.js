import { getStore } from "@netlify/blobs";

const store = () => getStore("todos");

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const keyFor = (date) => `tasks-${date}`;

export default async (req) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  if (!date) return json(400, { error: "Parameter 'date' wajib diisi, format YYYY-MM-DD." });

  const blobs = store();
  const key = keyFor(date);

  if (req.method === "GET") {
    const data = (await blobs.get(key, { type: "json" })) || [];
    return json(200, { tasks: data });
  }

  if (req.method === "POST") {
    const { text, time } = await req.json();
    if (!text || !text.trim()) return json(400, { error: "Isi task tidak boleh kosong." });

    const data = (await blobs.get(key, { type: "json" })) || [];
    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      time: time || null,
      done: false,
      notified: false,
    };
    data.push(task);
    await blobs.setJSON(key, data);
    return json(200, { tasks: data });
  }

  if (req.method === "PATCH") {
    const { id, done } = await req.json();
    const data = (await blobs.get(key, { type: "json" })) || [];
    const idx = data.findIndex((t) => t.id === id);
    if (idx === -1) return json(404, { error: "Task tidak ditemukan." });
    data[idx].done = done;
    await blobs.setJSON(key, data);
    return json(200, { tasks: data });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json();
    let data = (await blobs.get(key, { type: "json" })) || [];
    data = data.filter((t) => t.id !== id);
    await blobs.setJSON(key, data);
    return json(200, { tasks: data });
  }

  return json(405, { error: "Method tidak didukung." });
};

export const config = { path: "/api/tasks" };
