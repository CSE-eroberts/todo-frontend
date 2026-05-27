import { useState, useEffect } from "react";
import axios from "axios";
import Addtodo from "./Addtodo";

const todosUrl = "http://localhost:3001/api/todos";

function Todos() {
  const [todos, setTodos] = useState([]); //empty
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { //user types while we fetch in background
    async function fetchTodos() {
      const response = await axios.get(todosUrl);
      setTodos(response.data);
    }
    fetchTodos();
  }, []);

    function addTodo() {
      setIsAdding(true); //once clicked it will display <Addtodo />
    }

  return (
    <div className="todos">
      <h2>To Do List</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.title}</li>
        ))}
      </ul>
      {isAdding ? <Addtodo  /> : null // this is the text Adding
      }  
        

       <button
        className="add-todo-button" 
        type="button"
        aria-label="Add todo"
        onClick={addTodo}> 
          +
    </button>
    </div>
  );
}

export default Todos;
