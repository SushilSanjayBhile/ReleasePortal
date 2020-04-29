import React from 'react';
import axios from 'axios';
import { initialState, exampleReducer } from './reducer';
function computeExpensiveValue(value) {
    return value*1000;
}
function Parent({ a, b }) {
    // Only re-rendered if `a` changes:
    const child1 = React.useMemo(() => <Child1 a={computeExpensiveValue(a)} />, [a]);
    // Only re-rendered if `b` changes:
    const child2 = React.useMemo(() => <Child2 b={computeExpensiveValue(b)} />, [b]);
    return (
      <>
        {child1}
        {child2}
      </>
    )
  }
function Child1({a}) {
    return <div>Child1 comp{a}</div>
}
function Child2({b}) {
    return <div>Child2 comp{b}</div>
}

const TodosDispatch = React.createContext(null);
function TodosApp() {
    const [localCount, setLocalCount] = React.useState(10);
    // Note: `dispatch` won't change between re-renders
    const [todos, dispatch] = React.useReducer(exampleReducer, initialState);
  
    return (
      <TodosDispatch.Provider value={dispatch}>
        TodosCount: {localCount}
        <button onClick={() => setLocalCount((c) => c+1)}>Todos Button</button>
        <DeepTree todos={todos} />
      </TodosDispatch.Provider>
    );
  }
  function DeepTree(props) {
      const [localCount, setLocalCount] = React.useState(10);
      return (
          <div>
              Value dispatched by child: {props.todos.text}
              Iteration: {props.todos.count}
              DeepTreeCount: {localCount}
              <button onClick={() => setLocalCount((c) => c+1)}>Deep tree Button</button>
          <DeepChild></DeepChild>
          </div>

      )
  }
  function DeepChild(props) {
    // If we want to perform an action, we can get dispatch from context.
    const dispatch = React.useContext(TodosDispatch);
  
    function handleClick() {
      dispatch({ type: 'add', text: 'hello' });
    }
  
    return (
      <button onClick={handleClick}>Add todo</button>
    );
  }

  function UseEffectExample() {
    const [count, setCount] = React.useState(0);

    // Similar to componentDidMount and componentDidUpdate:
    React.useEffect(() => {
      // Update the document title using the browser API
        alert(`clicked for times ${count}`)
        alert('not called after any other components or useReducer hook is called')
    });
    return (
    <button onClick={() => setCount(c => c+1)}>Add Count</button>
    )
  }
function Examples(props) {
    return(
        <div>
            <div id='MemoExample'>
            Using MEmo for expensive computes. if the args not changes then skips
            calling the function.
            Conveniently, useMemo also lets you skip an expensive re-render of a child
            <div>
                <Parent a={10} b={30}></Parent>
            </div>
            </div>
            <div style={{margin:'5rem'}}></div>
            <div id='ContextExample'>
            Context for passing values deepdown the tree
                <TodosApp/>
            </div>
            <div style={{margin:'5rem'}}></div>
            <div id='UseEffectExample'>
            Use Effect Example
                <UseEffectExample/>
            </div>
        </div>
    )
}
export default Examples;