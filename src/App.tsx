import { useState } from "react";
import reactLogo from "./assets/react.svg";

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="container">
            <div className="row mt-5 mb-5">
                <div className="col">
                    <button className="btn btn-primary w-100">
                        + Add Bookmark
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <button className="btn btn-primary w-100">
                        + Add Bookmark
                    </button>
                </div>
            </div>

            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    );
}

export default App;
