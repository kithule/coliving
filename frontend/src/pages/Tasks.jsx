import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Tasks.css";
import LogoutButton from "../components/LogoutButton";
import "../styles/ContextMenu.css";
import { FaPersonPraying } from "react-icons/fa6";
import { TfiHome } from "react-icons/tfi";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState({});
  const [contextMenu, setContextMenu] = useState(null); // { mouseX, mouseY, taskId }

  useEffect(() => {
    getTasksWithUsernames();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null); // close menu on outside click
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const getTasksWithUsernames = async () => {
    try {
      const res = await api.get("/api/tasks/");
      const tasksData = res.data;
      const assigneeIds = [...new Set(tasksData.map((task) => task.assignee))];
      const idToUsername = {};
      for (let id of assigneeIds) {
        if (id != null) {
          const tenantRes = await api.get(`/api/tenant/${id}/`);
          idToUsername[id] = tenantRes.data.user.username;
        }
      }
      setTasks(tasksData);
      setAssignees(idToUsername);
    } catch (err) {
      alert(err);
    }
  };

  const deleteTask = (id) => {
    api
      .delete(`/api/tasks/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Task deleted!");
          getTasksWithUsernames();
        } else {
          alert("Failed to delete task.");
        }
      })
      .catch((error) => alert(error));
  };

  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-US");
  };

  return (
    <div>
      <section className="task-header">
        <TfiHome size={24} />
        <header>Welcome home!</header>
        <LogoutButton />
      </section>

      <p>
        Chores are fun!?
        <FaPersonPraying size={18} />
      </p>

      <section className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Creation Date</th>
              <th>Due Date</th>
              <th>Assignee</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                onContextMenu={(e) => {
                  e.preventDefault(); // prevent browser context menu
                  setContextMenu({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    taskId: task.id,
                  });
                }}
              >
                <td>{task.content}</td>
                <td>{formattedDate(task.created_at)}</td>
                <td>{formattedDate(task.due_at)}</td>
                <td>{assignees[task.assignee]}</td>
                <td>{task.progress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {contextMenu && (
        // unordered bulleted list
        <ul
          className="context-menu"
          style={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
          }}
        >
          {/* list item */}
          <li
            onClick={() => {
              deleteTask(contextMenu.taskId);
              setContextMenu(null);
            }}
          >
            Delete Task
          </li>
        </ul>
      )}
    </div>
  );
}

export default Tasks;
