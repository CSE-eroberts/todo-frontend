import { useState } from "react";

function Addtodo({ onAddTodo }) { 
  // Stores what the user is typing in the input box.
  const [title, setTitle] = useState("");

  function submitTodo(event) {
    // Stops the form from refreshing the page.
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    // Sends the typed title back to Todos.js so it can be saved.
    onAddTodo(trimmedTitle);
    setTitle("");
  }

  return (
    <form className="add-todo-form" onSubmit={submitTodo}>
      <input
        aria-label="New todo item"
        className="add-todo-input"
        // Updates title every time the user types.
        onChange={event => setTitle(event.target.value)}
        placeholder="New todo"
        type="text"
        value={title}
      />
      <button className="save-todo-button" type="submit">
        Add
      </button>
    </form>
  );
}

export default Addtodo;
