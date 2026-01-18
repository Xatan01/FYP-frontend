# Finwise App (Frontend)

React Native (Expo) frontend for the Finwise app. It includes authentication via Supabase and a multi-tab experience covering learning, trading tools, community, and profile management.

## Features
- Supabase email/password auth (login + register)
- Tab-based navigation with onboarding and profile flows
- Screens for learn, portfolio, watchlist, community, news, consultations, and more
- Reusable UI components and responsive sizing helpers

## Tech Stack
- React Native + Expo
- React Navigation (stack + bottom tabs)
- Supabase JS client
- Axios (API client placeholder)

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Restart Metro after changes:
```bash
npx expo start -c
```

### 3) Run the app
```bash
npm run start
```

Then open with the Expo Go app or run:
```bash
npm run android
npm run ios
```

## Supabase Setup (Auth + Profiles)
This app expects Supabase Auth to be enabled and a `profiles` table to store usernames.

SQL to create the table and policies:
```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = user_id);

create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = user_id);

create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = user_id);
```

Optional username availability RPC:
```sql
create or replace function public.is_username_available(name text)
returns boolean
language sql
security definer
as $$
  select not exists (
    select 1 from public.profiles where username = name
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon;
grant execute on function public.is_username_available(text) to authenticated;
```

## Project Structure
- `src/screens/` UI screens (Home, Learn, Watchlist, Portfolio, Profile, etc.)
- `src/navigation/` Navigation stacks and tab setup
- `src/components/` Reusable UI blocks
- `src/lib/supabase.js` Supabase client setup
- `src/api/api.js` Axios client (base URL placeholder)

## Notes
- Login/Register talk directly to Supabase Auth.
- If you add a backend, send the Supabase access token in the `Authorization: Bearer <token>` header.

## Scripts
- `npm run start` - Start Expo dev server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run web build with Expo

## Troubleshooting
- "Missing Supabase environment variables": ensure `.env` exists and restart with `npx expo start -c`.
- "Unable to resolve @supabase/supabase-js": run `npm install`.

