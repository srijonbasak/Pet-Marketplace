# Pet Marketplace Frontend

A React-based frontend for the Pet Marketplace application, providing a platform for pet adoption, rescue operations, and pet-related products.

## Features

- **Authentication:** User registration, login, and profile management
- **Pet Adoption:** Browse pets, apply for adoption, track applications
- **Pet Marketplace:** Buy and sell pet-related products
- **Rescue Operations:** Support and track animal rescue operations
- **Role-based Access:** Different interfaces for buyers, sellers, NGOs, and admins

## Technology Stack

- **React:** Frontend library for building user interfaces
- **React Router:** For navigation and routing
- **React Bootstrap:** UI component library
- **Axios:** HTTP client for API requests
- **JWT:** For authentication
- **FontAwesome:** For icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Pet Marketplace backend running on http://localhost:5000

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pet-marketplace.git
cd pet-marketplace/pet-marketplace-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. The application will be available at http://localhost:3000

## Project Structure

```
pet-marketplace-frontend/
├── public/                   # Public assets
├── src/                      # Source files
│   ├── components/           # Reusable components
│   │   ├── common/           # Common components (buttons, cards, etc.)
│   │   └── layout/           # Layout components (header, footer, etc.)
│   ├── context/              # Context providers
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Page components
│   ├── services/             # API service files
│   ├── utils/                # Utility functions
│   ├── App.js                # Main App component
│   └── index.js              # Entry point
└── package.json              # Dependencies and scripts
```

## Available Scripts

- `npm start`: Starts the development server
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects the create-react-app configuration

## Connecting to the Backend

The frontend is configured to connect to the backend at http://localhost:5000 using a proxy specified in package.json.

## User Roles

- **Buyer/Adopter:** Can browse pets and products, apply for adoptions
- **Seller:** Can list pets and products for sale
- **NGO:** Can list rescue pets for adoption and manage rescue operations
- **Admin:** Has access to all functionalities plus admin-specific features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Images from Unsplash
- Icons from FontAwesome
