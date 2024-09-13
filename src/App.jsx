import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Splash from "./pages/Splash";
import './App.css'


const router = createBrowserRouter([
    {
      path:"/",
      element: <Splash /> ,
    },
    {
        path: "/navigation",
        element: <Home />
    }
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;
