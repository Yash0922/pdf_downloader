# PDF Vault - Secure PDF Download App

A modern, responsive PDF download application built with React, Vite, Firebase Authentication, and Tailwind CSS.

## Features

- 🔐 **Google Authentication** - Secure login using Firebase
- 📄 **PDF Downloads** - Easy access to downloadable PDF documents
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Modern UI** - Clean and attractive user interface with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for optimal speed

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Firebase project with Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pdf-vault.git
cd pdf-vault
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Google Authentication in Firebase Authentication settings
   - Copy your Firebase configuration
   - Update `src/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
pdf-vault/
├── src/
│   ├── App.jsx          # Main application component
│   ├── firebase.js     # Firebase configuration
│   ├── index.css       # Global styles with Tailwind
│   └── main.jsx        # Application entry point
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Dependencies

- **React 19** - UI library
- **Firebase** - Authentication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Usage

1. Users can login with their Google account
2. Once authenticated, they can view and download available PDF files
3. The app displays file information including name, description, and size
4. Downloads are initiated with a single click

## Customization

### Adding PDF Files

Update the `pdfFiles` array in `App.jsx`:

```javascript
const pdfFiles = [
  { 
    id: 1, 
    name: 'Document.pdf', 
    description: 'Your description', 
    size: '2.4 MB' 
  },
  // Add more files...
];
```

### Styling

The app uses Tailwind CSS for styling. Customize the design by modifying the Tailwind classes in `App.jsx` or extend the theme in `tailwind.config.js`.

## Security

- All Firebase credentials should be stored in environment variables in production
- Authentication state is managed securely using Firebase SDK
- PDF downloads are simulated in this demo - implement proper backend integration for production use

## License

MIT License

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

For support, email support@pdfvault.com or open an issue in the repository.