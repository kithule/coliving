import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Tasks.css";
import LogoutButton from "../components/LogoutButton";

function Tasks() {
  const [tasks, setTasks] = useState([]); // hook that modifies data everytime data changes
  //   const [content, setContent] = useState("");
  //   const [title, setTitle] = useState("");
  const [assignees, setAssignees] = useState("");

  useEffect(() => {
    //like ngOnInit? hook that executes the function everytime page state changes or deps array changes
    getTasksWithUsernames();
  }, []);

  const getTasksWithUsernames = async () => {
    try {
      const response = await api.get("/api/tasks/");
      const tasksData = response.data;

      // set of all unique assignee IDs
      const assigneeIds = [...new Set(tasksData.map((task) => task.assignee))];

      // dictionary {tenant_id: username}
      const idToUsername = {};
      for (let id of assigneeIds) {
        if (id != null) {
          const userResponse = await api.get(`/api/tenant/${id}/`);
          console.log(userResponse);
          idToUsername[id] = userResponse.data.user.username;
        }
      }
      setTasks(tasksData);
      setAssignees(idToUsername);
    } catch (error) {
      alert(error);
    }
  };

  //   const deleteTasks = (id) => {
  //     api
  //       .delete(`/api/notes/delete/${id}/`)
  //       .then((res) => {
  //         if (res.status === 204) alert("Note deleted!");
  //         else alert("Failed to delete note.");
  //         getNotes();
  //       })
  //       .catch((error) => alert(error));
  //   };

  //   const createNote = (e) => {
  //     e.preventDefault();
  //     api
  //       .post("/api/notes/", { content, title })
  //       .then((res) => {
  //         if (res.status === 201) {
  //           alert("Note created!");
  //           setTitle("");
  //           setContent("");
  //         } else {
  //           alert("Failed to create note.");
  //         }
  //         getNotes();
  //       })
  //       .catch((error) => alert(error));
  //   };
  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-US");
  };
  return (
    <div>
      <section className="task-header">
        <header>Welcome home!</header>
        <LogoutButton />
      </section>

      <p>Chores are fun!?</p>
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
              <tr key={task.id}>
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
    </div>
  );
}

export default Tasks;
