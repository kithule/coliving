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
  const [flatmates, setFlatmates] = useState([]);
  const [contextMenu, setContextMenu] = useState(null); // { mouseX, mouseY, taskId }
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    content: "",
    due_at: "",
    assignee: "",
    progress: "TO DO",
  });

  useEffect(() => {
    getTasksWithUsernames();
    getFlatmates();
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

  const createTask = () => {
    if (!newTask.content || !newTask.due_at) {
      alert("Please fill in content and due date.");
    } else {
      api
        .post("api/tasks/", newTask)
        .then((res) => {
          if (res.status === 201) {
            alert("Task created!");
            setNewTask({
              content: "",
              due_at: "",
              assignee: "",
              progress: "TO DO",
            });
            setIsAdding(false);
            getTasksWithUsernames();
          } else {
            alert("Failed to create task.");
          }
        })
        .catch((err) => alert(err));
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

  const matchUsernameToTenantId = (username) => {
    for (let tenant of flatmates) {
      if (tenant.user.username === username) {
        return tenant.id;
      }
    }
  };

  const updateTask = (id, field, updateValue) => {
    let updatedJson;
    if (field === "assignee") {
      updatedJson = { [field]: matchUsernameToTenantId(updateValue) };
    } else {
      updatedJson = { [field]: updateValue };
    }
    api
      .patch(`api/tasks/update/${id}/`, updatedJson)
      .then((res) => {
        if (res.status === 200) {
          alert(`${field} updated!`);
          getTasksWithUsernames();
        } else {
          alert(`Failed to update ${field}.`);
        }
      })
      .catch((error) => alert(error));
  };

  const getFlatmates = () => {
    api
      .get("api/tenants/")
      .then((res) => res.data)
      .then((data) => {
        setFlatmates(data);
      })
      .catch((err) => alert(err));
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
                <td>
                  <select
                    name="assignee"
                    id="assignee-select"
                    defaultValue={assignees[task.assignee]}
                    onChange={(e) =>
                      updateTask(task.id, "assignee", e.target.value)
                    }
                  >
                    {flatmates.map((flatmate) => (
                      <option key={flatmate.id} value={flatmate.user.username}>
                        {flatmate.user.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    name="progress"
                    id="progress-select"
                    defaultValue={task.progress}
                    onChange={(e) =>
                      updateTask(task.id, "progress", e.target.value)
                    }
                  >
                    <option value="TO DO">To Do</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
              </tr>
            ))}
            {isAdding ? (
              <tr className="create-task-row">
                <td>
                  <input
                    type="text"
                    value={newTask.content}
                    onChange={(e) =>
                      setNewTask({ ...newTask, content: e.target.value })
                    }
                    placeholder="Content"
                  ></input>
                </td>
                <td>{new Date().toLocaleDateString()}</td>
                <td>
                  <input
                    type="text"
                    value={newTask.created_at}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        due_at: e.target.value,
                      })
                    }
                    placeholder="Due at: yyyy-mm-dd"
                  ></input>
                </td>
                <td>
                  <select
                    name="assignee"
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignee: e.target.value })
                    }
                  >
                    {flatmates.map((flatmate) => (
                      <option key={flatmate.id} value={flatmate.user.username}>
                        {flatmate.user.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    name="progress"
                    onChange={(e) =>
                      setNewTask({ ...newTask, progress: e.target.value })
                    }
                  >
                    <option value="TO DO">To Do</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td>
                  <button onClick={createTask}>✔</button>
                  <button onClick={() => setIsAdding(false)}>✖</button>
                </td>
              </tr>
            ) : (
              <tr
                className="add-task-row"
                onClick={() => setIsAdding(true)}
                style={{ cursor: "pointer" }}
              >
                <td colSpan="6" style={{ textAlign: "center" }}>
                  <strong>＋</strong>
                </td>
              </tr>
            )}
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
