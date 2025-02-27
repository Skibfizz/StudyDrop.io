# StudyMind - AI-Powered Learning Platform

StudyMind is a modern learning platform that leverages AI to enhance your study experience. Process YouTube lectures, generate flashcards, and improve your study materials with AI-powered tools.

## 🚀 Features

- **YouTube Learning**: Process and summarize video lectures automatically
- **Flashcard Generation**: Create study flashcards from any content
- **Text Humanization**: Transform and improve text content
- **Smart Summaries**: Get AI-powered summaries of your study materials
- **Progress Tracking**: Monitor your learning progress
- **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI Integration**: OpenAI API
- **Payments**: Stripe
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/studymind.git
cd studymind
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your configuration values.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🔧 Configuration

### Required Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
```

See `.env.example` for all available configuration options.

## 📚 Documentation

### API Routes

- `/api/youtube-process`: Process YouTube videos
- `/api/humanize`: Text humanization
- `/api/flashcards`: Flashcard generation
- `/api/webhooks/stripe`: Stripe webhook handler

### Database Schema

The application uses Supabase with the following main tables:
- `users`: User profiles
- `subscriptions`: User subscription data
- `usage_tracking`: Feature usage tracking

## 🧪 Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## 🚀 Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/studymind)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) 