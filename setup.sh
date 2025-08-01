#!/bin/bash

echo "🚀 Setting up Level Up Daily - Gamified Productivity App"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Generate Prisma client
echo "🗄️ Setting up database..."
npx prisma generate

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
    echo "   DATABASE_URL=\"postgresql://username:password@localhost:5432/level_up_daily\""
    echo "   JWT_SECRET=\"your-super-secret-jwt-key-here\""
fi

cd ..

# Install frontend dependencies
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Create PostgreSQL database: createdb level_up_daily"
echo "3. Run database migrations: cd backend && npx prisma db push"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npx expo start"
echo ""
echo "🎉 Happy coding!" 