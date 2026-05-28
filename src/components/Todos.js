import { useState, useEffect } from "react";
import axios from "axios";
import Addtodo from "./Addtodo";

const todosUrl = "https://todo-backend-w3qq.onrender.com/api/todos";

function isTrue(value) {
  return value === true || value === "true";
}

// Uses the completed value from the backend to decide if the todo is checked off.
function isTodoCompleted(todo) {
  const completedValue =
    todo.completed ??
    todo.checked ??
    todo.complete ??
    todo.isCompleted ??
    todo.done;

  return isTrue(completedValue);
}

function Todos() {
  const [todos, setTodos] = useState([]); //empty
  const [fetchError, setFetchError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  // Turns the pencil/trash buttons on and off.
  const [isEditingList, setIsEditingList] = useState(false);
  // Stores which todo row is currently being edited.
  const [editingTodoId, setEditingTodoId] = useState(null);
  // Stores the new text while the user edits a row.
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => { //user types while we fetch in background
    async function fetchTodos() {
      try {
        const response = await axios.get(todosUrl);
        setTodos(
          response.data.map(todo => ({
            ...todo,
            completed: isTodoCompleted(todo),
          }))
        );
        setFetchError("");
      } catch (error) {
        setFetchError("Could not load todos. Make sure the backend server is running on port 3001.");
      }
    }
    fetchTodos();
  }, []);

  function addTodo() {
    setIsAdding(true); //once clicked it will display <Addtodo />
  }

  function toggleEditMode() {
    // Shows or hides the pencil and trashcan buttons.
    setIsEditingList(currentValue => !currentValue);
    setEditingTodoId(null);
    setEditingTitle("");
  }

  async function saveTodo(title) {
    try {
      // Sends the typed todo title to the backend so it can be saved.
      const response = await axios.post(todosUrl, { title: title });
      const savedTodo = {
        ...response.data,
        completed: isTodoCompleted(response.data),
      };

      // Adds the saved backend todo to the list on the page.
      setTodos(currentTodos => [...currentTodos, savedTodo]);
      setIsAdding(false);
      setFetchError("");
    } catch (error) {
      setFetchError("Could not save todo. Make sure the backend server is running on port 3001.");
    }
  }

  // Toggles completed so the checkbox and crossed-out text update.
  async function toggleTodo(todoId) {
    const todoToUpdate = todos.find(todo => todo._id === todoId);

    if (!todoToUpdate) {
      return;
    }

    try {
      const response = await axios.patch(`${todosUrl}/${encodeURIComponent(todoId)}`, {
        completed: !isTodoCompleted(todoToUpdate),
      });
      const updatedTodo = {
        ...response.data,
        completed: isTodoCompleted(response.data),
      };

      setTodos(currentTodos =>
        currentTodos.map(todo =>
          todo._id === todoId ? updatedTodo : todo
        )
      );
      setFetchError("");
    } catch (error) {
      setFetchError("Could not update todo. Make sure the backend server is running on port 3001.");
    }
  }

  function startEditingTodo(todo) {
    // Puts this row into edit mode and fills the input with the current text.
    setEditingTodoId(todo._id);
    setEditingTitle(todo.title);
  }

  async function saveEditedTodo(todoId) {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      // Sends the changed row text to the backend.
      const response = await axios.patch(`${todosUrl}/${encodeURIComponent(todoId)}`, {
        title: trimmedTitle,
      });
      const updatedTodo = {
        ...response.data,
        completed: isTodoCompleted(response.data),
      };

      // Replaces the old row with the edited todo returned by the backend.
      setTodos(currentTodos =>
        currentTodos.map(todo =>
          todo._id === todoId ? updatedTodo : todo
        )
      );
      setEditingTodoId(null);
      setEditingTitle("");
      setFetchError("");
    } catch (error) {
      setFetchError("Could not edit todo. Make sure the backend server is running on port 3001.");
    }
  }

  async function deleteTodo(todoId) {
    try {
      // Tells the backend to delete this todo.
      await axios.delete(`${todosUrl}/${encodeURIComponent(todoId)}`);

      // Removes the deleted row from the list on the page.
      setTodos(currentTodos =>
        currentTodos.filter(todo => todo._id !== todoId)
      );
      setFetchError("");
    } catch (error) {
      setFetchError("Could not delete todo. Make sure the backend server is running on port 3001.");
    }
  }

  return (
    <div className="todos">
      <h2>To Do List</h2>
      {fetchError ? <p className="todo-error">{fetchError}</p> : null}
      <ul>
        {todos.map(todo => (
          <li
            // This completed class lets CSS add the strike-through style.
            className={isTodoCompleted(todo) ? "todo-item todo-item-completed" : "todo-item"}
            key={todo._id}
          >
            <input
              aria-label={`Mark ${todo.title} as ${isTodoCompleted(todo) ? "incomplete" : "completed"}`}
              checked={isTodoCompleted(todo)}
              className="todo-checkbox"
              onChange={() => toggleTodo(todo._id)}
              type="checkbox"
            />
            {editingTodoId === todo._id ? (
              <form
                className="edit-todo-form"
                onSubmit={event => {
                  event.preventDefault();
                  saveEditedTodo(todo._id);
                }}
              >
                <input
                  aria-label={`Edit ${todo.title}`}
                  className="edit-todo-input"
                  onChange={event => setEditingTitle(event.target.value)}
                  type="text"
                  value={editingTitle}
                />
                <button className="save-edit-button" type="submit">
                  Save
                </button>
              </form>
            ) : (
              <span className="todo-title">{todo.title}</span>
            )}
            {isEditingList ? (
              <div className="todo-actions">
                {/* Pencil emoji button opens the input for this row. */}
                <button
                  aria-label={`Edit ${todo.title}`}
                  className="todo-action-button"
                  onClick={() => startEditingTodo(todo)}
                  title="Edit"
                  type="button"
                >
                  {"\u270F\uFE0F"}
                </button>
                {/* Trashcan emoji button deletes this row. */}
                <button
                  aria-label={`Delete ${todo.title}`}
                  className="todo-action-button"
                  onClick={() => deleteTodo(todo._id)}
                  title="Delete"
                  type="button"
                >
                  {"\u{1F5D1}"}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {isAdding ? <Addtodo onAddTodo={saveTodo} /> : null
      }  
        

      <div className="todo-list-controls">
        <button
          className="add-todo-button" 
          type="button"
          aria-label="Add todo"
          onClick={addTodo}> 
            +
        </button>
        <button
          className={isEditingList ? "edit-list-button edit-list-button-active" : "edit-list-button"}
          type="button"
          aria-label={isEditingList ? "Save todo list edits" : "Edit todo list"}
          onClick={toggleEditMode}>
            {/* This button turns the pencil and trashcan buttons on and off. */}
            {isEditingList ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
}

export default Todos;
