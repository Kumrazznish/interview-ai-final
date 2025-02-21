import { useState } from "react";

const VideoSummaryCard = ({ onClose }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/summarize-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Summarize Video</h2>
      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter video URL"
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <button
        onClick={handleSummarize}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? "Summarizing..." : "Summarize"}
      </button>
      {summary && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 w-full bg-gray-300 text-black p-2 rounded-lg hover:bg-gray-400"
      >
        Close
      </button>
    </div>
  );
};

export default VideoSummaryCard;