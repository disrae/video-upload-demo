'use client'
import { useEffect, useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Assuming you have a Firebase config file

export default function Home() {
  const [upload, setUpload] = useState<{ url: string, id: string } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const generateUploadUrl = async () => {
      try {
        const response = await fetch('/api/generate-upload-url', {
          method: 'POST',
        });
        const upload = await response.json() as { url: string, id: string };
        setUpload(upload);
      } catch (error) {
        console.error('Error generating upload URL:', error);
      }
    };

    generateUploadUrl();
  }, []);

  const handleUploadSuccess = async () => {
    console.log('Upload success');
    if (!upload) { return console.error('No upload ID found'); }
    try {
      const response = await fetch('/api/get-asset-from-upload-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId: upload.id }),
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve asset');
      }
      const asset = await response.json();
      saveToFirestore(asset.asset_id);
      console.log('saving to firestore');
    } catch (error) {
      console.error('Error retrieving asset:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const saveToFirestore = async (assetId: string) => {
    if (!upload?.id || selectedTags.length === 0) return;

    try {
      await setDoc(doc(db, "videos", upload.id), {
        assetId,
        tags: selectedTags,
        time: new Date().toISOString(),
      });
      console.log("Video saved to Firestore");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  const resetUpload = () => {
    setUpload(null);
    setSelectedTags([]);
    const generateUploadUrl = async () => {
      try {
        const response = await fetch('/api/generate-upload-url', {
          method: 'POST',
        });
        const upload = await response.json() as { url: string, id: string };
        setUpload(upload);
      } catch (error) {
        console.error('Error generating upload URL:', error);
      }
    };
    generateUploadUrl();
  };

  const tags = ["Life Insurance", "Single Trip", "AD&D", "Final Expense", "Snow Birds",
    "Multi Trip", "Discovery", "Introduction"];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Video Upload Dashboard</h1>
      <div className="border p-4 bg-gray-50 rounded-lg mt-4">
        <div className="">
          <h3 className="text-lg font-semibold ">Select Tags:</h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded ${selectedTags.includes(tag)
                  ? 'bg-gray-300 text-gray-800'
                  : 'bg-gray-200 text-gray-700 shadow-md hover:bg-gray-300'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-8" />
      {selectedTags.length > 0 && <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl mb-2">Upload a Video</h2>
        <MuxUploader endpoint={upload?.url} onSuccess={handleUploadSuccess} />
        <div className="h-4" />
        <div className="flex justify-center">
          <button
            onClick={resetUpload}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 shadow-md hover:bg-gray-300"
          >
            New Upload
          </button>
        </div>
      </div>}
    </div>
  );
}
