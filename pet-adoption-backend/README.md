# Pet Marketplace with Adoption & Rescue - Backend API

This repository contains the backend API for the Pet Marketplace platform, which allows users to buy/sell pet-related products and facilitates pet adoption and rescue operations.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Pet Marketplace**: API for managing products and transactions 
- **Pet Adoption**: Complete adoption workflow from application to follow-up
- **NGO Support**: Tools for managing rescue operations and donations
- **Admin Panel**: Administrative functions for managing users, products, and financial data

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for building the API
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication using JSON Web Tokens
- **Express Validator**: Input validation

## Models

- **User**: Authentication and profile management (buyers, sellers, NGOs, admins)
- **Product**: Marketplace products
- **Pet**: Pets available for adoption
- **Adoption**: Adoption applications and processing
- **Rescue**: NGO rescue operations

## API Routes

### User Routes
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Authenticate user
- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update user profile
- `PUT /api/users/change-password`: Change password
- `GET /api/users/:id`: Get user by ID (public profile)
- `POST /api/users/favorites`: Add pet/product to favorites
- `DELETE /api/users/favorites`: Remove from favorites

### Pet Routes
- `GET /api/pets`: Get all pets with filters
- `GET /api/pets/:id`: Get a pet by ID
- `POST /api/pets`: Create a new pet listing
- `PUT /api/pets/:id`: Update a pet
- `DELETE /api/pets/:id`: Delete a pet
- `POST /api/pets/:id/images`: Upload pet images
- `DELETE /api/pets/:id/images`: Remove pet image

### Adoption Routes
- `GET /api/adoptions`: Get all adoptions with filters
- `GET /api/adoptions/:id`: Get a single adoption by ID
- `POST /api/adoptions`: Create a new adoption application
- `PUT /api/adoptions/:id/status`: Update adoption status
- `POST /api/adoptions/:id/messages`: Add a message to adoption communication
- `POST /api/adoptions/:id/follow-up`: Add a follow-up entry

### Rescue Routes
- `GET /api/rescues`: Get all rescue operations
- `GET /api/rescues/:id`: Get a rescue operation by ID
- `POST /api/rescues`: Create a new rescue operation
- `PUT /api/rescues/:id`: Update a rescue operation
- `PUT /api/rescues/:id/status`: Update rescue status
- `POST /api/rescues/:id/team`: Add team members
- `POST /api/rescues/:id/updates`: Add an update
- `POST /api/rescues/:id/donate`: Add a donation
- `PUT /api/rescues/:id/outcomes`: Update rescue outcomes

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRE`: JWT expiration time 