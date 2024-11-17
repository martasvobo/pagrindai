import { Button, Layout } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate, Outlet } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";
import { useAuth } from "./contexts/authContext/useAuth";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const { currentUser, userLoading } = useAuth();

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate("/login");
    }
  }, [userLoading, currentUser, navigate]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center bg-blue-500 p-4">
        <div
          className="text-white text-xl cursor-pointer"
          onClick={handleTitleClick}
        >
          Film Haven
        </div>
        <Button
          type="primary"
          shape="circle"
          icon={<UserOutlined />}
          onClick={handleProfileClick}
        />
      </Header>
      <Content className="flex-grow p-12">
        <Outlet />
      </Content>
      <Footer className="text-center">
        Film Haven ©{new Date().getFullYear()} Created by KTU studentai
      </Footer>
    </Layout>
  );
};

export default MainLayout;
