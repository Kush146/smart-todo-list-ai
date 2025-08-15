import { useEffect, useState } from "react";

const ContextHistory = () => {
  const [contextEntries, setContextEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all context entries
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/context/?page_size=100")
      .then((response) => response.json())
      .then((data) => {
        // Make sure that the data is properly formatted
        setContextEntries(data.results || []);
      })
      .catch((error) =>
        console.error("Error fetching context entries:", error)
      );
  }, []);

  // Filter entries based on search query
  const filteredEntries = contextEntries.filter((entry) =>
    (typeof entry.content === "string"
      ? entry.content
      : JSON.stringify(entry.content || "")
    )
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        📜 Context History
      </h1>

      {/* Search Bar */}
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Search context entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {filteredEntries.length === 0 ? (
        <p className="text-gray-500">No matching context entries found.</p>
      ) : (
        <ul className="space-y-4 mt-6">
          {filteredEntries.map((entry, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-indigo-600 font-medium">
                  {entry.source_type || "Unknown Source"}
                </span>
                <span className="text-xs text-gray-500">
                  {entry.created_at
                    ? new Date(entry.created_at).toLocaleString()
                    : "No date"}
                </span>
              </div>

              <p className="mt-2 text-gray-800">
                {entry.content || "No content available"}
              </p>

              {entry.processed_insights && Object.keys(entry.processed_insights).length > 0 && (
                <p className="mt-2 text-sm text-gray-500 italic">
                  💡 Insight:{" "}
                  {typeof entry.processed_insights === "object"
                    ? JSON.stringify(entry.processed_insights)
                    : entry.processed_insights}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContextHistory;
