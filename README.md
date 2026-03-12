# live-sub

A real-time YouTube subscriber counter that works **without Google login** (no OAuth required).
Includes a beautiful **OBS overlay mode** for livestreams.

## How It Works

The app uses the [YouTube Data API v3](https://developers.google.com/youtube/v3/) with a simple **API key** — no Google sign-in or OAuth flow needed. Just open the page, enter your key and a channel ID (or `@handle`), and watch the count update live.

## Quick Start

1. **Get a free YouTube Data API key**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project (or pick an existing one).
   - Enable the **YouTube Data API v3**.
   - Go to **Credentials → Create Credentials → API key**.

2. **Find the Channel ID or handle**
   - Use the channel handle directly, e.g. `@Anishlovo`.
   - Or find the Channel ID from the URL: `youtube.com/channel/UCxxxxxxxxxxxxxxxx`.

3. **Run the app**
   - Open `index.html` in any modern browser.
   - Paste your API key and the Channel ID or `@handle`.
   - Click **Start** — the subscriber count updates automatically.

No server, no build step, no login screen. Just a static HTML page.

## OBS Overlay Mode

Use this as a **Browser Source** in OBS for a beautiful live subscriber count overlay on your stream.

### Setup

1. In OBS, add a new **Browser Source**.
2. Set the URL to:

   ```
   file:///path/to/index.html?key=YOUR_API_KEY&channel=@YourHandle&interval=5
   ```

   | Parameter   | Description                                   |
   | ----------- | --------------------------------------------- |
   | `key`       | Your YouTube Data API v3 key                  |
   | `channel`   | Channel ID (`UCxxx`) or handle (`@Anishlovo`) |
   | `interval`  | Refresh interval in seconds (default: `5`)    |

3. Set the **Width** to `600` and **Height** to `400`.
4. Check **"Shutdown source when not visible"** (optional).
5. The overlay auto-starts with a transparent background — no setup form needed.

### Features

- 🎨 Transparent background — blends into any scene
- ✨ Animated glow effects and smooth number transitions
- 🖼️ Channel avatar with glowing border
- 🔄 Auto-refreshing subscriber count
- 📱 Works with channel IDs and `@handles`

## Files

| File         | Purpose                              |
| ------------ | ------------------------------------ |
| `index.html` | Main page                            |
| `style.css`  | Styling (dark theme + OBS overlay)   |
| `script.js`  | Fetches and displays subscriber data |

## YouTube API Subscriber Count Limitation

Since August 2019, the YouTube Data API v3 returns **approximate (abbreviated) subscriber counts** for channels with 1,000 or more subscribers. The counts are rounded to three significant figures:

| Subscriber range   | Rounding          | Example              |
| ------------------ | ----------------- | -------------------- |
| 0 – 999            | Exact             | 876 → 876            |
| 1,000 – 9,999      | Nearest 10        | 1,234 → 1,230        |
| 10,000 – 99,999    | Nearest 100       | 45,678 → 45,700      |
| 100,000 – 999,999  | Nearest 1,000     | 100,369 → 100,000    |
| 1,000,000+         | Nearest 10,000    | 1,234,567 → 1,230,000|

This is a YouTube platform limitation, not a bug in this tool. The app displays a **≈** prefix and an informational note when the count is approximate. Channel owners can see their exact subscriber count in [YouTube Studio](https://studio.youtube.com/).

## License

MIT