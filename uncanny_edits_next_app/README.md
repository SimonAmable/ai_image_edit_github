# Next.js SaaS Starter Template

A minimalist modern and feature-rich Next.js starter template for building SaaS applications with Supabase, Stripe, and more. Created to be a starting point for personal applications, public for free!

## Features

- **Authentication**: Secure user authentication with Supabase Auth.
- **Subscriptions**: Stripe integration for managing subscription plans.
- **Database**: Supabase for a powerful and easy-to-use database.
- **UI Components**: A set of reusable UI components for core features, keep or delete.
- **Feedback System**: A built-in feedback system for collecting user feedback.
- **Email**: Resend integration for sending transactional emails.
- **Analytics**: TODO (comming soon)

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm (or yarn/pnpm)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/SimonAmable/next-saas-template.git
    cd next-saas-starter-template
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file by copying the example:

    ```bash
    cp sample-env.md .env.local
    ```

    Then, fill in the required values in `.env.local`.

4.  **Set up the database:**

    Log in to your Supabase account and navigate to the SQL Editor. Paste the content of `supabase/migrations/0000_create_profiles_table.sql` and run the query.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Environment Variables

| Variable                                   | Description                                                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                 | Your Supabase project URL.                                                                                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`            | Your Supabase project's anonymous key.                                                                                                   |
| `SUPABASE_SERVICE_ROLE_KEY`                | Your Supabase project's service role key.                                                                                                |
| `STRIPE_SECRET_KEY`                        | Your Stripe secret key.                                                                                                                  |
| `STRIPE_WEBHOOK_SECRET`                    | Your Stripe webhook secret.                                                                                                              |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTLY` | The ID of your basic monthly subscription plan in Stripe.                                                                                |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTLY`   | The ID of your pro monthly subscription plan in Stripe.                                                                                  |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`             | Your Google client ID for Google authentication.                                                                                         |
| `RESEND_API_KEY`                           | Your Resend API key for sending emails.                                                                                                  |
| `FEEDBACK_EMAIL_TO`                        | The email address where feedback submissions will be sent.                                                                               |
| `NEXT_PUBLIC_SITE_URL`                     | The public URL of your application. Local or Prod. Defaults to `http://localhost:3000`.                                                                 |

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

This is a public project but was made for personal use. Contributions are still always welcome! Please open an issue or submit a pull request if you have any ideas or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
