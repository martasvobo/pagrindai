import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import MovieDescription from "./MovieDescription";
import MovieList from "./MovieList";
import Profile from "./Profile";
import { Helmet } from "react-helmet";

function App() {
  return (
    <Router>
      <Helmet>
        <title>Film Haven</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MovieList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="movie/:id" element={<MovieDescription />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
