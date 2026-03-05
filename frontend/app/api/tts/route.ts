import { NextRequest, NextResponse } from 'next/server';

const MAX_TEXT_LENGTH = 5000;

export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing or empty "text" field' }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    // No API key configured — tell the client to use browser-based TTS fallback
    return NextResponse.json(
      { error: 'TTS service not configured', fallback: true },
      { status: 501 },
    );
  }

  try {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'en-US', name: 'en-US-Neural2-J' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      },
    );

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text();
      console.error('Google TTS API error:', ttsResponse.status, errBody);
      return NextResponse.json(
        { error: 'TTS synthesis failed', fallback: true },
        { status: 502 },
      );
    }

    const data = await ttsResponse.json();
    const audioContent: string = data.audioContent; // base64-encoded MP3

    const audioBuffer = Buffer.from(audioContent, 'base64');

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="article-audio.mp3"',
        'Content-Length': String(audioBuffer.length),
      },
    });
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fallback: true },
      { status: 500 },
    );
  }
}
