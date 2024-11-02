# postify web app 

This project is a backend API for a social media application similar to Facebook, built using Express.js, MongoDB, Node.js, and Passport.js for authentication. It includes features for user authentication, authorization, profile management, engaging with users, following/unfollowing, liking posts, and viewing them.

## Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Demo
There is no live demo available for the backend API.

## Features
- User authentication and authorization using Passport.js
- User profile management (edit profile, view profile)
- Engaging with other users (follow/unfollow)
- Like and comment on posts
- View posts from followed users

## Technologies Used
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
- [Passport.js](http://www.passportjs.org/)

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/facebook-like-backend.git
    cd facebook-like-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    SESSION_SECRET=your_session_secret
    ```

4. Run the development server:
    ```bash
    npm run dev
    ```

5. The server will be running at `http://localhost:5000`.

## Usage
- **User Registration**: Sign up for a new account using `/api/auth/register`.
- **User Login**: Log in with your registered credentials using `/api/auth/login`.
- **Edit Profile**: Update your profile information using `/api/profile`.
- **View Profile**: See your own profile information using `/api/profile/:userId`.
- **Follow/Unfollow Users**: Connect with other users using `/api/users/follow` and `/api/users/unfollow`.
- **Like and Comment on Posts**: Engage with posts from users you follow using `/api/posts/like` and `/api/posts/comment`.
- **View News Feed**: See posts from users you follow on your news feed using `/api/posts/feed`.

## Project Structure
