
# Project Title

A brief description of what this project does and who it's for

QuikPing
========
A fast, secure, and modern real-time chat application with private messaging, group chats,
QR-based friend connect, and message destruction features.
Live Demo
---------
QuikPing Live: https://quikping.vercel.app/
Tech Stack
----------
- Frontend: React.js, CSS
- Backend: Firebase (Firestore, Auth, Storage)
- QR Code: qrcode.react, react-qr-reader
Features
--------
- Authentication (Email/Password + Google Login)
- 1-on-1 Private Chat
- Group Chat with join via Group Code
- QR Code Connect - scan & send friend requests
- Self-Destruct Messages with user-defined timers
- Mobile-Responsive UI with smooth animations
- Edit Profile - update name & avatar
- Real-time Messaging via Firestore
- Typing Indicator for friends and groups
- Firebase Storage Integration for avatars
Folder Structure (Key Parts)
----------------------------
src/
- components/
- - ChatUI/ # Core UI (ChatWindow, FriendConnectUI)
- - QRScanner.jsx # For scanning QR UIDs
- - YourQR.jsx # User's personal QR code
- - Sidebar.jsx # Navigation tabs
- - ...
- context/
- - ChatContext.js # Global state for auth and chat
- firebase/
- - config.js # Firebase initialization
- App.jsx # Routing and layout
Setup & Run Locally
-------------------
1. Clone the repo
 git clone https://github.com/Jatiiiiiiiin/QuikPing.git
 cd QuikPing
2. Install dependencies
 npm install
3. Firebase Setup
 - Create a project on Firebase Console
 - Enable Firestore, Authentication, and Storage
 - Replace Firebase config inside src/firebase/config.js
4. Run the project
 npm start
To Do / Future Improvements
---------------------------
- Dark/Light Mode Toggle
- Push Notifications
- Internationalization (i18n)
- Voice/Video Calling (possible with WebRTC)
Author
------
Built with love by Jatin Thakur (https://github.com/Jatiiiiiiiin)
License
-------
This project is licensed under the MIT License.