'use client'
import { useEffect, useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Assuming you have a Firebase config file

export default function Home() {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [assetId, setAssetId] = useState<string | null>(null);

  useEffect(() => {
    const generateUploadUrl = async () => {
      try {
        const response = await fetch('/api/generate-upload-url', {
          method: 'POST',
        });
        const {url, id} = await response.json() as {url: string, id: string};
        setUploadUrl(url);
        setAssetId(id);
      } catch (error) {
        console.error('Error generating upload URL:', error);
      }
    };

    generateUploadUrl();
  }, []);

  const handleUploadSuccess = async (res: any) => {
    console.log({res});
    setUploadId(res.id);
  };

  const handleUploadComplete = (event: CustomEvent) => {
    const { asset } = event.detail;
    if (asset && asset.id) {
      setAssetId(asset.id);
      console.log('Upload complete. Asset ID:', asset.id);
    }
  };

  useEffect(() => {
    window.addEventListener('upload-complete' as any, handleUploadComplete);
    return () => {
      window.removeEventListener('upload-complete' as any, handleUploadComplete);
    };
  }, []);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const saveToFirestore = async () => {
    if (!assetId || selectedTags.length === 0) return;

    try {
      await setDoc(doc(db, "videos", assetId), {
        assetId,
        tags: selectedTags,
      });
      console.log("Video saved to Firestore");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  const tags = ["Life Insurance", "Single Trip", "Discovery", "For You Page"];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Upload Dashboard</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl mb-2">Upload a Video</h2>
        <MuxUploader endpoint={uploadUrl} onSuccess={handleUploadSuccess} />
        {assetId && (
          <div className="mt-4">
            <p className="text-green-600">
              Upload successful! Asset ID: {assetId}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Select Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveToFirestore}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={!assetId || selectedTags.length === 0}
            >
              Save to Firestore
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
