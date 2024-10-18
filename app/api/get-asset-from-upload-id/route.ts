import { NextResponse } from 'next/server';
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

const waitForThreeSeconds = () =>
  new Promise((resolve) => setTimeout(resolve, 3000));

async function getAsset(uploadId: string) {
  let attempts = 0;
  while (attempts <= 10) {
    const upload = await mux.video.uploads.retrieve(uploadId);
    
    if (upload.asset_id) {
      return upload;
    } else {
      await waitForThreeSeconds();
      attempts++;
    }
  }
  throw new Error("No asset_id found for upload");
}

export async function POST(request: Request) {
  const { uploadId } = await request.json();
  
  try {
    const asset = await getAsset(uploadId);
    console.log({asset});
    return NextResponse.json(asset);
  } catch (error) {
    console.error({error});
    return NextResponse.json({ error: 'Failed to retrieve asset' }, { status: 500 });
  }
}