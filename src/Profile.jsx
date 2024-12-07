import { useState, useEffect } from "react";
import { Avatar, Card, Image,Input,  Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { auth, db } from "../firebase"; // Import existing Firebase setup
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Modal, List } from "antd";

const Profile = () => {
  const [showFriends, setShowFriends] = useState(true);
  const [profilePic, setProfilePic] = useState(""); // Current profile picture URL
  const [loading, setLoading] = useState(false); // Loading state for saving
  const [name, setName] = useState(""); // User's name
  const [surname, setSurname] = useState(""); // User's surname
  const [username, setUsername] = useState(""); // User's username
  const user = auth.currentUser; // Get current user from Firebase Auth
  const [isFriendsPopupVisible, setIsFriendsPopupVisible] = useState(false); // For popup visibility
  const [friendsList, setFriendsList] = useState([]); // Friends fetched from Firebase

  // Array of pictures to select from
  const pictures = [
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.wVOujSiT5EqOWW0Bk_4ZPAHaE8%26pid%3DApi&f=1&ipt=f10564c4507999d98bf3c50f0e074a8a963fd97220f43d7449a74305f872d477&ipo=images",
    "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimages6.fanpop.com%2Fimage%2Fphotos%2F35200000%2FCute-Pandas-pandas-35203695-948-964.jpg&f=1&nofb=1&ipt=c9cb1939f490930f6b640392259b7e9d0e649f76071fb2221cec41affa884222&ipo=images",
    "https://miro.medium.com/v2/resize:fit:500/1*6Ukzy9YDn1FYRDjG-1_FIA@2x.jpeg",
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FfvYqJwyFUC4%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=41d04f86fac9c12a48dd0df2974077de929e7344b43225846d5745d69fe663da&ipo=images",
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fw0.peakpx.com%2Fwallpaper%2F933%2F448%2FHD-wallpaper-pitbull-muscles-big-fighter-strong.jpg&f=1&nofb=1&ipt=dc37afed3fad5224066cf5005afa1059124cc0ffde8386ce20b72719b212128f&ipo=images",
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fb5%2F1f%2F71%2Fb51f71b6421f4b65aecef786425a9217.jpg&f=1&nofb=1&ipt=a68763a29eb7e8cc67d88df393a1763a65a0e97bdd04549a2bcdd9f8d70a742e&ipo=images",
  ];

  // Fetch user's profile picture when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userDoc);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setProfilePic(data.photoUrl || ""); // Set the profile picture
          setName(data.name || ""); // Set the name
          setSurname(data.surname || ""); // Set the surname
          setUsername(data.username || ""); // Set the username
        }
      }
    };

    fetchProfileData();
  }, [user]);

  // Function to handle profile picture selection
  const handleSelectPicture = async (picture) => {
    setLoading(true);
    try {
      if (user) {
        const userDoc = doc(db, "users", user.uid);

        // Save the selected picture URL to Firestore
        await updateDoc(userDoc, { photoUrl: picture });
        setProfilePic(picture); // Update local state
        message.success("Profile picture updated successfully!");
      } else {
        message.error("User is not logged in.");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      message.error("Failed to update profile picture. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      if (user) {
        const userDoc = doc(db, "users", user.uid);

        // Save name, surname, and username to Firestore
        await updateDoc(userDoc, {
          name: name,
          surname: surname,
          username: username,
        });

        message.success("Details updated successfully!");
      } else {
        message.error("User is not logged in.");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      message.error("Failed to update details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (user) {
      try {
        const friendshipsQuery = query(
          collection(db, "friendships"),
          where("clientID", "==", user.uid)
        );
  
        const querySnapshot = await getDocs(friendshipsQuery);
  
        if (!querySnapshot.empty) {
          const friendsData = querySnapshot.docs[0].data().friends || [];
  
          // Process all friends
          const formattedFriends = await Promise.all(
            friendsData.flatMap((friend) =>
              Object.entries(friend).map(async ([friendId, timestamp]) => {
                const userDoc = doc(db, "users", friendId);
                const userSnapshot = await getDoc(userDoc);
  
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  return {
                    id: friendId,
                    addedAt: timestamp.toDate().toISOString(),
                    username: userData.username || "Unknown",
                    photoUrl: userData.photoUrl || null,
                  };
                } else {
                  return {
                    id: friendId,
                    addedAt: timestamp.toDate().toISOString(),
                    username: "Unknown",
                    photoUrl: null,
                  };
                }
              })
            )
          );
  
          setFriendsList(formattedFriends);
        } else {
          console.error("No matching document found for the given user ID.");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };
  

  // Handle opening friends popup
  const handleOpenFriendsPopup = async () => {
    await fetchFriends();
    setIsFriendsPopupVisible(true);
  };
  
  // Handle closing friends popup
  const handleCloseFriendsPopup = () => {
    setIsFriendsPopupVisible(false);
  };

  return (
    <div className="p-4">
      {showFriends && <h1 className="text-2xl font-bold mb-4">Profile Page</h1>}
      <div className="flex flex-col items-center mb-4">
        <Avatar
          size={150}
          src={profilePic} // Show the selected profile picture
          icon={!profilePic && <UserOutlined />}
          className="mb-4"
        />
      </div>
      <Card title="Select a Profile Picture" className="w-full max-w-md mx-auto my-4">
        <div className="grid grid-cols-3 gap-4">
          {pictures.map((picture, index) => (
            <Image
              key={index}
              src={picture}
              alt={`Profile Option ${index + 1}`}
              className="cursor-pointer"
              width={100}
              height={100}
              style={{
                border: profilePic === picture ? "2px solid #1890ff" : "none",
                borderRadius: "8px",
              }}
              onClick={() => handleSelectPicture(picture)}
            />
          ))}
        </div>
      </Card>
      <Card title="Edit Profile Details" className="w-full max-w-md mx-auto my-4">
        <div className="mb-4">
          <label>Name:</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-4">
          <label>Surname:</label>
          <Input
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter your surname"
          />
        </div>
        <div className="mb-4">
          <label>Username:</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <Button type="primary" onClick={handleSaveDetails} loading={loading}>
          Save Details
        </Button>
      </Card>
      {/* Picture Selection Gallery */}
      
      {showFriends && (
        <>
        <Card
          title="Current Friends"
          className="w-full max-w-md mx-auto my-4"
        >
          <Button type="primary" onClick={handleOpenFriendsPopup}>
            View All Friends
          </Button>
        </Card>
  
        <Modal
          title="Your Friends"
          visible={isFriendsPopupVisible}
          onCancel={handleCloseFriendsPopup}
          footer={null}
        >
          <List
            dataSource={friendsList}
            renderItem={(friend) => (
              <List.Item key={friend.id}>
                <List.Item.Meta
                  avatar={<Avatar src={friend.photoUrl} icon={!friend.photoUrl && <UserOutlined />} />}
                  title={friend.username}
                  description={`Became friends on: ${new Date(friend.addedAt).toLocaleDateString()}`}
                />
              </List.Item>
            )}
          />
        </Modal>
      </>
      )}
    </div>
  );
};

export default Profile;