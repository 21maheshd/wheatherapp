# WheatherApp

This wheather app ranks how desirable a city/town is for several activities over the next 7 days using Open-Meteo APIs.

Features

- GraphQL backend that geocodes cities and fetches a 7-day forecast from Open-Meteo.
- Scoring logic for activities: Skiing, Surfing, Outdoor sightseeing, Indoor sightseeing.
- React + TypeScript frontend with debounce and autocomplete for city search.
- Bootstrap for layout and components.

Quick start

1. Install dependencies for server and client (run from repo root):

```bash
cd server
npm install

cd ../client
npm install
```

2. Start the GraphQL server (port 4000):

```bash
cd server
npm run dev
```

3. Start the frontend (port 3000):

```bash
cd client
npm run dev
```

Open http://localhost:3000 and search for a city. The app provides autocomplete suggestions and will display activity rankings and daily scores for the next 7 days plus current one.

Notes

- The backend uses Open-Meteo's geocoding API and forecast endpoints.
- Scoring is intentionally simple and designed to be readable and extensible.

Files of interest

- Server: [server/src/resolvers.ts](server/src/resolvers.ts#L1) — scoring and resolver logic
- Server: [server/src/weatherService.ts](server/src/weatherService.ts#L1) — Open-Meteo API client
- Client: [client/src/components/SearchBox.tsx](client/src/components/SearchBox.tsx#L1) — debounce + autocomplete
- Client: [client/src/App.tsx](client/src/App.tsx#L1) — fetches ranking and renders UI

Next steps / improvements

- Add caching for geocoding and forecast responses.
- Improve scoring using more weather variables (cloud cover, UV, wave height, etc.).
As of now Open-Meteo APIs only supports hourly data for snowfall, wind, rain etc params which can be use to precisely caclulate the scores to make this app more robust.

# AI assistance
Used lovable to conceptulize the UI look & feel which then used to design components.
Used ChatGPT for building  logic for Skiing Surfing, Outdoor sightseeing, Indoor sightseeing etc as its complicated data to decide relevant & final score.
