export async function saveLogToLaravel(userId: number, prompt: string, response?: string) {
  await fetch('http://localhost:8000/api/ai/chat/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      prompt_text: prompt,
      response_text: response || null,
      action_type: 'chat',
    }),
  });
}

export async function getRecentLogsFromLaravel(userId: number) {
  const res = await fetch(`http://localhost:8000/api/ai/chat/log/${userId}`);
  if (!res.ok) return [];
  return await res.json();
}
