import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import MainLayout from "./MainLayout";
import MovieDescription from "./Movie";
import Profile from "./Profile";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="movie/:movieId" element={<MovieDescription />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
