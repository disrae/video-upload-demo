import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        cors_origin: "*", // TODO: change this to the domain of the app in production
        new_asset_settings: {
          playback_policy: ["public"],
          video_quality: "basic"
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate upload URL');
    }

    const data = await response.json();
    const { url, id} = data.data;
    console.log(data);

    return NextResponse.json({ url, id }, { status: 200 });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
