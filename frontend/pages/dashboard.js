// frontend/pages/dashboard.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { getJSON } from "../utils/api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contexts, setContexts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const tasksRes = await getJSON("/api/tasks/?page_size=100");
        const catsRes = await getJSON("/api/categories/");
        const contextRes = await getJSON("/api/context/?page_size=5");

        // Sort tasks by AI priority score
        const sortedTasks = (tasksRes.results || []).sort(
          (a, b) => b.priority_score - a.priority_score
        );

        setTasks(sortedTasks);
        setCategories(catsRes || []);
        setContexts(contextRes.results || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }
    fetchData();
  }, []);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const upcomingDeadlines = tasks.filter((t) => {
    if (!t.deadline) return false;
    const deadlineDate = new Date(t.deadline);
    const today = new Date();
    const diffDays = (deadlineDate - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // Pie Chart Data
  const pieData = {
    labels: ["Completed", "Pending", "Upcoming Deadlines"],
    datasets: [
      {
        data: [completedTasks, pendingTasks, upcomingDeadlines.length],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
      },
    ],
  };

  return (
    <main className="grid gap-6 p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Total Tasks</h3>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Pending</h3>
          <p className="text-2xl font-bold">{pendingTasks}</p>
        </div>
        <div className="bg-red-500 text-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
          <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow max-w-sm mx-auto">
        <h3 className="text-center text-lg font-semibold mb-4">Task Overview</h3>
        <Pie data={pieData} />
      </div>

      {/* AI Highlight */}
      {tasks.length > 0 && (
        <div className="bg-purple-100 border border-purple-300 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-purple-800">
            🔥 High Priority Task (AI Suggested)
          </h2>
          <p className="font-medium">{tasks[0].title}</p>
          <p className="text-sm text-gray-600">{tasks[0].description}</p>
          {tasks[0].deadline && (
            <p className="text-xs text-gray-500">
              Due {new Date(tasks[0].deadline).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Recent Context Entries */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">📝 Recent Context</h2>
        {contexts.length > 0 ? (
          <ul className="space-y-2">
            {contexts.map((c) => (
              <li key={c.id} className="border p-3 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>{c.source_type}:</strong> {c.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent context available.</p>
        )}
        <Link
          href="/context-history"
          className="inline-block mt-3 text-blue-600 hover:underline text-sm"
        >
          View full history →
        </Link>
      </div>

      {/* Task List */}
      <section className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Tasks</h2>
        <Link href="/tasks" className="px-3 py-2 rounded-2xl bg-gray-200">
          + Quick Add
        </Link>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href={`/tasks?id=${t.id}`}
            className="p-4 rounded-xl shadow bg-white hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium truncate">{t.title}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  t.priority_score >= 70
                    ? "bg-red-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {Math.round(t.priority_score)}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.5rem]">
              {t.description}
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {t.categories.map((c) => (
                <span
                  key={c.id}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-xl"
                >
                  {c.name}
                </span>
              ))}
            </div>
            {t.deadline && (
              <div className="mt-2 text-xs text-gray-500">
                Due {new Date(t.deadline).toLocaleString()}
              </div>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
