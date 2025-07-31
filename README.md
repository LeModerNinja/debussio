# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/44fa8a40-8512-4999-b86f-e2a5ecd9af71

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/44fa8a40-8512-4999-b86f-e2a5ecd9af71) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Code Organization

The codebase is optimized for token efficiency with:

- **Centralized Types**: All TypeScript interfaces in `src/types/`
- **Shared Constants**: Common data in `src/constants/`
- **Reusable Hooks**: Data fetching logic in `src/hooks/`
- **Common Components**: Shared UI components in `src/components/common/`
- **Utility Functions**: Helper functions in `src/utils/`
- **Service Layer**: API interactions in `src/services/`

## API Integrations

This project integrates with several APIs for concert discovery:

- **Eventbrite API**: Global event discovery and ticketing
- **TicketMaster Discovery API**: Major venue concerts
- **Bandsintown API**: Artist-specific events
- **MusicBrainz API**: Classical music metadata
- **OpenAI API**: AI-powered concert tagging

### Setting up API Keys

To enable all features, you'll need to configure the following environment variables in your Supabase Edge Functions:

```bash
EVENTBRITE_TOKEN=your_eventbrite_token
TICKETMASTER_API_KEY=your_ticketmaster_key
BANDSINTOWN_APP_ID=your_bandsintown_id
OPENAI_API_KEY=your_openai_key
```

Visit `/eventbrite` to test the Eventbrite integration.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/44fa8a40-8512-4999-b86f-e2a5ecd9af71) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
