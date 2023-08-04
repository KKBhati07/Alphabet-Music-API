# Alphabet Music API

The Alphabet Music API allows users to upload and manage music files. It provides endpoints for uploading music files, fetching songs, and user authentication.

## Installation

1. Clone the repository to your local machine:
- git clone https://github.com/KKBhati07/Alphabet-Music-API.git

2. Move to the project directory

3. On your Command Prompt/powershell, run this command to install all your dependencies
- npm install

4. Configure the database:
- Update the MongoDB connection in config/mongoose.js if necessary.

5. start the server:
- node index.js 

## Usage

To use the Alphabet Music API, you can make HTTP requests to the provided endpoints using tool like `Postman`, or integrate it into your front-end application.

## API Endpoints

- `POST /api/v1/songs/upload`: Upload a music file along with metadata (title, artist, album) to the server.
- `GET /api/v1/songs/fetch`: Fetch a list of all songs from the server.
- `DELETE /api/v1/songs/destroy/:id`: Delete a song from the server.
- `POST /api/v1/users/create`: Create a new user account.
- `POST /api/v1/users/create-session`: Log in and create a session with a user account.
- `PATCH /api/v1/users/update/:id`: Update user's details (authentication required) .
- `PATCH /api/v1/users/update`: Update user details (authentication required) .
- `DELETE /api/v1/users/destroy`: Delete a user account (authentication required).

## Authentication

It uses JSON Web Tokens (JWT) for user authentication. To access protected endpoints, include the JWT token in the `Authorization` header of the request.

## Screenshots

![Alphabet-Music-API Screenshot](./assets/images/screenshots/1.png)
