# JeevesBot Frontend

A modern, responsive Progressive Web App (PWA) frontend for the JeevesBot calendar application. Built with TypeScript, React.js, Next.js, and Tailwind CSS.

## Features

- 📅 **Calendar View**: Clean, organized display of appointments grouped by date
- ➕ **Easy Appointment Creation**: Intuitive form for adding new appointments
- 🗑️ **Delete Functionality**: Simple appointment deletion with confirmation
- 📱 **Progressive Web App**: Installable on mobile devices and desktop
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🧪 **Test-Driven Development**: Comprehensive test suite with Jest and React Testing Library
- 🔒 **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **PWA**: Next.js PWA configuration
- **State Management**: React Hooks (useState, useEffect)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JeevesBot/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_APP_NAME=JeevesBot Calendar
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Testing

The project follows Test-Driven Development (TDD) principles with comprehensive test coverage.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **API Tests**: Frontend API route testing

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (proxies to backend)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Calendar.tsx       # Calendar display component
│   └── AddAppointmentForm.tsx # Appointment form
├── types/                 # TypeScript type definitions
│   └── calendar.ts        # Calendar-related types
├── __tests__/            # Test files
│   ├── Calendar.test.tsx
│   ├── AddAppointmentForm.test.tsx
│   └── page.test.tsx
├── public/               # Static assets
│   └── manifest.json     # PWA manifest
└── package.json
```

## API Integration

The frontend communicates with the backend through Next.js API routes that proxy requests to the backend server.

### Available Endpoints

- `GET /api/appointments` - Fetch all appointments
- `POST /api/appointments` - Create new appointment
- `DELETE /api/appointments/[id]` - Delete appointment by ID

## PWA Features

- **Installable**: Can be installed as a standalone app on mobile and desktop
- **Offline Ready**: Basic offline functionality (future enhancement)
- **Responsive**: Optimized for all screen sizes
- **Fast**: Optimized performance with Next.js

## Development

### Adding New Features

1. Write tests first (TDD approach)
2. Implement the feature
3. Ensure all tests pass
4. Update documentation if needed

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write comprehensive tests

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Implement your changes
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details