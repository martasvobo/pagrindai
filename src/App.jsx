import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import Home from "./Home";
import Login from "./Login";
import MainLayout from "./MainLayout";
import CreateMovie from "./movies/CreateMovie";
import EditMovie from "./movies/EditMovie";
import MovieDescription from "./movies/Movie";
import Profile from "./Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="movie/:movieId" element={<MovieDescription />} />
            <Route path="movie/create" element={<CreateMovie />} />
            <Route path="movie/edit/:movieId" element={<EditMovie />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
