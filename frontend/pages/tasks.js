import { useState, useEffect } from "react";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Priority mapping
  const priorityMap = { low: 1, medium: 2, high: 3 };

  // Fetch tasks
  const fetchTasks = () => {
    fetch("http://127.0.0.1:8000/api/tasks/")
      .then((res) => res.json())
      .then((data) => setTasks(data.results || []))
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  // Fetch categories
  const fetchCategories = () => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  // Auto-create category if missing
  const createCategoryIfMissing = async (name) => {
    const existing = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      return newCat.id;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  };

  // Create or update task
  const handleSaveTask = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      category_ids: categoryIds.map((id) => parseInt(id)),
      priority_score: priorityMap[priority] || 1,
      deadline: deadline || null,
    };

    const url = editingTaskId
      ? `http://127.0.0.1:8000/api/tasks/${editingTaskId}/`
      : "http://127.0.0.1:8000/api/tasks/";

    fetch(url, {
      method: editingTaskId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          alert("Failed to save task");
          console.error(data);
          return;
        }
        if (editingTaskId) {
          setTasks(tasks.map((t) => (t.id === editingTaskId ? data : t)));
          setEditingTaskId(null);
        } else {
          setTasks([...tasks, data]);
          fetchAiSuggestionsAndUpdateTask(data); // AI + auto-update
        }
        resetForm();
      })
      .catch((err) => console.error("Error saving task:", err));
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDeadline("");
    setCategoryIds([]);
  };

  // AI Suggestions + Auto-update backend
  const fetchAiSuggestionsAndUpdateTask = async (task) => {
    const payload = {
      task: task.title,
      priority: task.priority_score,
      deadline: task.deadline || new Date().toISOString(),
      context: task.description,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai/suggest/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setAiSuggestions(data);

      let updatedCategories = task.category_ids || [];
      if (data.categories && Array.isArray(data.categories)) {
        const ids = [];
        for (const aiCat of data.categories) {
          const id = await createCategoryIfMissing(aiCat);
          if (id) ids.push(id);
        }
        if (ids.length > 0) updatedCategories = ids;
      }

      const updatedTaskData = {
        title: task.title,
        description: data.improved_description || task.description,
        category_ids: updatedCategories,
        priority_score: data.priority_score || task.priority_score,
        deadline: data.deadline_suggestions?.[0] || task.deadline,
      };

      const updateRes = await fetch(
        `http://127.0.0.1:8000/api/tasks/${task.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTaskData),
        }
      );
      const updatedTask = await updateRes.json();
      if (updateRes.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      }
    } catch (err) {
      console.error("Error fetching/updating AI suggestions:", err);
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(
      Object.keys(priorityMap).find(
        (key) => priorityMap[key] === task.priority_score
      ) || "medium"
    );
    setDeadline(task.deadline || "");
    setCategoryIds(task.categories?.map((c) => c.id) || []);
  };

  // Delete task
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, { method: "DELETE" }).then(
      (res) => {
        if (res.ok) {
          setTasks(tasks.filter((t) => t.id !== id));
        }
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Tasks</h1>

      {/* Form */}
      <form
        onSubmit={handleSaveTask}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <select
            multiple
            value={categoryIds}
            onChange={(e) =>
              setCategoryIds(
                Array.from(e.target.selectedOptions, (opt) =>
                  parseInt(opt.value)
                )
              )
            }
            className="mt-1 block w-full rounded-md border-gray-300"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
        >
          {editingTaskId ? "Update Task" : "Add Task"}
        </button>
      </form>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <div className="mt-8 bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4">
            AI Suggestions
          </h2>
          {aiSuggestions.priority_score && (
            <p>Priority Score: {aiSuggestions.priority_score}</p>
          )}
          {aiSuggestions.deadline_suggestions && (
            <>
              <p>Suggested Deadlines:</p>
              <ul>
                {aiSuggestions.deadline_suggestions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}
          {aiSuggestions.improved_description && (
            <p>Improved Description: {aiSuggestions.improved_description}</p>
          )}
          {aiSuggestions.categories && (
            <>
              <p>Suggested Categories:</p>
              <ul>
                {aiSuggestions.categories.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tasks</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-medium">{task.title}</h3>
              <p>{task.description}</p>
              <p>Priority: {task.priority_score}</p>
              <p>Deadline: {task.deadline}</p>
              {task.categories?.length > 0 && (
                <p>Categories: {task.categories.map((c) => c.name).join(", ")}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-1 bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
