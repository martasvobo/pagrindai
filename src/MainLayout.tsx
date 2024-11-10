import { Button, Card, Layout } from "antd";
import { useNavigate } from "react-router";
import "tailwindcss/tailwind.css";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ items }) => {
  //const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const movies = [
    {
      id: 1,
      image: "/assets/wolf.webp",
      title: "Wolf of Wall Street",
      description:
        "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street.",
    },
    {
      id: 2,
      image: "/assets/james.webp",
      title: "Casino Royale",
      description:
        "James Bond's first mission as 007 leads him to Le Chiffre, banker to the world's terrorists.",
    },
    {
      id: 3,
      image: "/assets/gray.jfif",
      title: "50 Shades of Gray",
      description:
        "Literature student Anastasia Steele's life changes forever when she meets handsome, yet tormented, billionaire Christian Grey.",
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center bg-blue-500 p-4">
        <div className="text-white text-xl">Film Haven</div>
        <Button type="primary" onClick={handleProfileClick}>
          Profile
        </Button>
      </Header>
      <Content className="flex-grow p-12">
        <div className="p-6 min-h-96 bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <Card
                key={movie.id}
                hoverable
                cover={
                  <div className="h-64 overflow-hidden">
                    <img
                      alt={movie.title}
                      src={movie.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                }
                onClick={() => handleMovieClick(movie.id)}
              >
                <Card.Meta
                  title={movie.title}
                  description={movie.description}
                />
              </Card>
            ))}
          </div>
        </div>
      </Content>
      <Footer className="text-center">
        Film Haven ©{new Date().getFullYear()} Created by KTU studentai
      </Footer>
    </Layout>
  );
};

export default MainLayout;
