import { useState, useEffect } from "react";
import { getTaskSuggestions } from "../utils/api"; // API function for AI

const API_BASE = "http://127.0.0.1:8000/api"; // change if your backend path differs

const ContextInput = () => {
  const [contextEntries, setContextEntries] = useState([]);
  const [sourceType, setSourceType] = useState("note");
  const [content, setContent] = useState("");
  const [taskSuggestions, setTaskSuggestions] = useState(null);

  // Fetch all context entries
  const fetchContextEntries = () => {
    fetch(`${API_BASE}/context/`) // <-- Change to match Django endpoint
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data) => setContextEntries(data.results || data || []))
      .catch((err) => console.error("Error fetching context entries:", err));
  };

  useEffect(() => {
    fetchContextEntries();
  }, []);

  // Handle add context + AI suggestions
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { source_type: sourceType, content };

    try {
      // Save context entry
      const res = await fetch(`${API_BASE}/context/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to add context: ${res.status}`);

      const newEntry = await res.json();
      setContextEntries([newEntry, ...contextEntries]);
      setSourceType("note");
      setContent("");

      // Fetch AI task suggestions
      const taskData = {
        task: "New context added",
        priority: "medium",
        deadline: new Date().toISOString(),
        context: newEntry.content,
      };

      const suggestionResponse = await getTaskSuggestions(taskData);
      setTaskSuggestions(suggestionResponse);
    } catch (error) {
      console.error("Error adding context entry:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">Daily Context</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 mt-6 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md border"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source Type
          </label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="note">Note</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your message or note"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700"
          >
            Add Context Entry
          </button>
        </div>
      </form>

      {/* AI Suggestions */}
      {taskSuggestions && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4">
            AI Task Suggestions
          </h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(taskSuggestions, null, 2)}
          </pre>
        </div>
      )}

      {/* Context History */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Context History
        </h2>
        <ul className="space-y-4">
          {contextEntries.map((entry) => (
            <li
              key={entry.id || Math.random()}
              className="border p-4 rounded-lg bg-gray-50 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                <span className="font-medium capitalize">
                  {entry.source_type}
                </span>{" "}
                —{" "}
                {entry.created_at
                  ? new Date(entry.created_at).toLocaleString()
                  : "No date"}
              </p>
              <p className="text-gray-800 mt-1">
                {typeof entry.content === "object"
                  ? JSON.stringify(entry.content)
                  : entry.content}
              </p>
              {entry.processed_insights && (
                <p className="text-xs text-gray-600 mt-2">
                  Insights:{" "}
                  {typeof entry.processed_insights === "object"
                    ? JSON.stringify(entry.processed_insights, null, 2)
                    : entry.processed_insights}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContextInput;
