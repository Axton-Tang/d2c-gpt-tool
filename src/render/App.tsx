import { Routes, Route } from "react-router-dom";
import Layout from "./layout";
import routes from "./route";

function App() {

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((route) => {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            );
          })}
        </Route>
      </Routes>
    </div>
  );
}

export default App