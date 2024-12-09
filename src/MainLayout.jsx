import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Button, Divider, Layout, Popover, Modal, message } from "antd";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { auth, db } from "../firebase";
import { getDocs, query, where, collection, doc, updateDoc, setDoc, getDoc, Timestamp } from "firebase/firestore";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false); // State for the logout confirmation modal
  const [friendRequests, setFriendRequests] = useState([]);


  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };


  const fetchFriendRequests = async () => {
    if (auth.currentUser) {
      try {
        const friendRequestsQuery = query(
          collection(db, "friendRequests"),
          where("requesteeID", "==", auth.currentUser.uid),
          where("status", "==", "waiting")
        );
  
        const querySnapshot = await getDocs(friendRequestsQuery);
  
        // Process each friend request and fetch the requester's name
        const requests = await Promise.all(
          querySnapshot.docs.map(async (requestDoc) => {
            const requestData = requestDoc.data();
            const requesterDoc = await getDoc(doc(db, "users", requestData.requesterID));
            const requesterName = requesterDoc.exists() ? requesterDoc.data().username : "Unknown";
  
            return {
              id: requestDoc.id,
              ...requestData,
              requesterName, // Include requester's name
            };
          })
        );
  
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    }
  };



  const notificationContent = (
    <div>
      {friendRequests.length > 0 ? (
        friendRequests.map((request) => (
          <div key={request.id} className="mb-2">
            <p>
              <strong>From:</strong> {request.requesterName}
            </p>
            <p>
              <strong>Date:</strong> {new Date(request.date).toLocaleString()}
            </p>
            <p>
              <strong>Message:</strong> {request.invitationText || "No message"}
            </p>
            <div className="flex space-x-2">
              <Button
                type="primary"
                size="small"
                onClick={() => handleAcceptRequest(request)}
              >
                Accept
              </Button>
              <Button
                type="default"
                size="small"
                danger
                onClick={() => handleDenyRequest(request)}
              >
                Deny
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p>No new notifications</p>
      )}
    </div>
  );

  const handleAcceptRequest = async (request) => {
    try {
      const { id, requesterID, requesteeID } = request;
  
      // Update the friend request status to "accepted"
      const requestDoc = doc(db, "friendRequests", id);
      await updateDoc(requestDoc, { status: "accepted" });
  
      // Add the friendship entries for both users
      const friendshipsQuery = query(
        collection(db, "friendships"),
        where("clientID", "==", requesteeID)
      );
      const querySnapshot = await getDocs(friendshipsQuery);
  
      const timestamp = Timestamp.now(); // Firestore Timestamp
  
      if (!querySnapshot.empty) {
        const userFriendshipDoc = querySnapshot.docs[0].ref;
        const friends = querySnapshot.docs[0].data().friends || [];
        const newFriend = { [requesterID]: timestamp };
        await updateDoc(userFriendshipDoc, { friends: [...friends, newFriend] });
      } else {
        const newDocRef = doc(collection(db, "friendships"));
        await setDoc(newDocRef, {
          clientID: requesteeID,
          friends: [{ [requesterID]: timestamp }],
        });
      }
  
      // Repeat for the requester
      const requesterQuery = query(
        collection(db, "friendships"),
        where("clientID", "==", requesterID)
      );
      const requesterSnapshot = await getDocs(requesterQuery);
  
      if (!requesterSnapshot.empty) {
        const requesterFriendshipDoc = requesterSnapshot.docs[0].ref;
        const friends = requesterSnapshot.docs[0].data().friends || [];
        const newFriend = { [requesteeID]: timestamp };
        await updateDoc(requesterFriendshipDoc, { friends: [...friends, newFriend] });
      } else {
        const newDocRef = doc(collection(db, "friendships"));
        await setDoc(newDocRef, {
          clientID: requesterID,
          friends: [{ [requesteeID]: timestamp }],
        });
      }
  
      // Remove the request from local state
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));
      message.success("Friend request accepted.");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      message.error("Failed to accept friend request. Please try again.");
    }
  };
  
  const handleDenyRequest = async (request) => {
    try {
      const { id } = request;
  
      // Update the friend request status to "denied"
      const requestDoc = doc(db, "friendRequests", id);
      await updateDoc(requestDoc, { status: "denied" });
  
      // Remove the request from local state
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));
      message.success("Friend request denied.");
    } catch (error) {
      console.error("Error denying friend request:", error);
      message.error("Failed to deny friend request. Please try again.");
    }
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
        <div>
          <Popover
            content={notificationContent}
            title="Notifications"
            trigger="click"
            onVisibleChange={(visible) => {
              if (visible) {
                fetchFriendRequests();
              }
            }}
          >
            <Badge count={friendRequests.length}>
              <BellOutlined
                style={{
                  fontSize: "24px",
                  color: "white",
                  marginRight: "16px",
                }}
              />
            </Badge>
          </Popover>
          <Divider type="vertical" />
          <Button
            type="default"
            danger={true}
            onClick={() => setIsModalVisible(true)} // Show confirmation modal
          >
            Logout
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            shape="circle"
            icon={<UserOutlined />}
            onClick={handleProfileClick}
          />
        </div>
      </Header>
      <Content className="flex-grow p-12">
        <Outlet />
      </Content>
      <Footer className="text-center">
        Film Haven ©{new Date().getFullYear()} Created by KTU studentai
      </Footer>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        visible={isModalVisible}
        onOk={async () => {
          setIsModalVisible(false);
          await handleLogout(); // Logout on confirmation
        }}
        onCancel={() => setIsModalVisible(false)} // Close modal on cancel
        okText="Yes, Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
