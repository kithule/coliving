import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note";
import "../styles/Home.css";
import LogoutButton from "../components/LogoutButton";

function Home() {
  const [notes, setNotes] = useState([]); // hook that modifies data everytime data changes
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [currentTenant, setCurrentTenant] = useState("");

  useEffect(() => {
    //like ngOnInit? hook that executes the function everytime page state changes or deps array changes
    getCurrentTenant();
    getNotes();
  }, []);

  const getCurrentTenant = () => {
    api
      .get("/api/tenant/")
      .then((res) => setCurrentTenant(res.data))
      .catch((err) => alert(err));
  };

  const getNotes = () => {
    api
      .get("/api/notes/")
      .then((res) => res.data)
      .then((data) => {
        setNotes(data);
      })
      .catch((err) => alert(err));
  };

  const deleteNotes = (id) => {
    api
      .delete(`/api/notes/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) alert("Note deleted!");
        else alert("Failed to delete note.");
        getNotes();
      })
      .catch((error) => alert(error));
  };

  const createNote = (e) => {
    e.preventDefault();
    api
      .post("/api/notes/", { content, title })
      .then((res) => {
        if (res.status === 201) {
          alert("Note created!");
          setTitle("");
          setContent("");
        } else {
          alert("Failed to create note.");
        }
        getNotes();
      })
      .catch((error) => alert(error));
  };
  return (
    <div>
      <section className="home-header">
        <header>Welcome home!</header>
        <LogoutButton />
      </section>

      <p>Check out all the notes your flatmates left!</p>
      <section className="display-notes-section">
        <section className="notes-grid">
          {notes.map((note) => (
            <Note
              note={note}
              onDelete={deleteNotes}
              key={note.id}
              currentTenant={currentTenant}
            />
          ))}
        </section>
      </section>

      <section className="create-note-section">
        <h2>Create a note</h2>
        <form onSubmit={createNote}>
          <label htmlFor="title">Title:</label>
          <br />
          <input
            type="text"
            id="title"
            name="title"
            required
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <label htmlFor="content">Content:</label>
          <br />
          <textarea
            id="content"
            name="content"
            required
            onChange={(e) => setContent(e.target.value)}
            value={content}
          ></textarea>
          <br />
          <input type="submit" value="Submit"></input>
        </form>
      </section>
    </div>
  );
}

export default Home;
