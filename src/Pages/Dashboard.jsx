import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    setTasks(data || []);
  };

  const addTask = async () => {
    if (!task.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("tasks").insert([
      {
        title: task,
        user_id: user.id,
      },
    ]);

    setTask("");
    getTasks();
  };

  const deleteTask = async (id) => {
    await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    getTasks();
  };

  const updateTask = async (id) => {
    await supabase
      .from("tasks")
      .update({
        status: "Completed",
      })
      .eq("id", id);

    getTasks();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">📋 Task Manager</h2>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="task-form">
        <input
          value={task}
          placeholder="What needs to be done?"
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />

        <button className="add-btn" onClick={addTask}>
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Add one above!</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((item) => (
            <div key={item.id} className="task-card">
              <div className="task-info">
                <h4>{item.title}</h4>
                <span
                  className={`task-status ${
                    item.status === "Completed"
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              <div className="task-actions">
                {item.status !== "Completed" && (
                  <button
                    className="complete-btn"
                    onClick={() => updateTask(item.id)}
                  >
                    ✓ Complete
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(item.id)}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;