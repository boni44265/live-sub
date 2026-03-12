# live-sub

A real-time YouTube subscriber counter that works **without Google login** (no OAuth required).

## How It Works

The app uses the [YouTube Data API v3](https://developers.google.com/youtube/v3/) with a simple **API key** — no Google sign-in or OAuth flow needed. Just open the page, enter your key and a channel ID, and watch the count update live.

## Quick Start

1. **Get a free YouTube Data API key**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project (or pick an existing one).
   - Enable the **YouTube Data API v3**.
   - Go to **Credentials → Create Credentials → API key**.

2. **Find the Channel ID**
   - Open the YouTube channel page.
   - The Channel ID is in the URL: `youtube.com/channel/UCxxxxxxxxxxxxxxxx`.
   - Or use [this tool](https://commentpicker.com/youtube-channel-id.php) to look it up.

3. **Run the app**
   - Open `index.html` in any modern browser.
   - Paste your API key and the Channel ID.
   - Click **Start** — the subscriber count updates automatically.

No server, no build step, no login screen. Just a static HTML page.

## Files

| File         | Purpose                              |
| ------------ | ------------------------------------ |
| `index.html` | Main page                            |
| `style.css`  | Styling (dark theme)                 |
| `script.js`  | Fetches and displays subscriber data |

## License

MIT