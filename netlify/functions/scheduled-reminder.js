import { getStore } from "@netlify/blobs";

const store = () => getStore("todos");

// Jam lokal (default WIB = UTC+7). Ubah lewat env var APP_TZ_OFFSET kalau perlu.
function localNow() {
  const offset = Number(process.env.APP_TZ_OFFSET ?? 7);
  const now = new Date(Date.now() + offset * 60 * 60 * 1000);
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const min = String(now.getUTCMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, hh, min, totalMin: Number(hh) * 60 + Number(min) };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset di Netlify env vars.");
    return;
  }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export default async () => {
  const { date, totalMin } = localNow();
  const blobs = store();
  const key = `tasks-${date}`;
  const data = (await blobs.get(key, { type: "json" })) || [];

  let changed = false;

  for (const task of data) {
    if (task.done || task.notified || !task.time) continue;
    const taskMin = toMinutes(task.time);
    // Kirim kalau waktunya sudah lewat/pas, dan masih dalam jendela 15 menit terakhir
    if (taskMin <= totalMin && totalMin - taskMin < 15) {
      await sendTelegram(`⏰ <b>Waktunya:</b> ${task.text} (${task.time})`);
      task.notified = true;
      changed = true;
    }
  }

  if (changed) await blobs.setJSON(key, data);

  return new Response("ok");
};

export const config = { schedule: "*/15 * * * *" };
