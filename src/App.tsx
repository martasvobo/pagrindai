import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import MovieDescription from "./MovieDescription";
import Profile from "./Profile";
import { Helmet } from "react-helmet";
import Login from "./Login";
import Home from "./Home";

function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <title>Film Haven</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="movie/:id" element={<MovieDescription />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
