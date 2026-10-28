# Thor AI setup

Thor uses a Vercel serverless function and the OpenAI Responses API. The API key stays on the server; it is never sent to the browser.

## Deploy

1. Import this GitHub repository into Vercel and deploy it as a Vercel project.
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` with your OpenAI API key. Set it for the environments you use, then redeploy.
3. Open the Vercel deployment and send a message to Thor.

`OPENAI_MODEL` is optional. If omitted, the function uses `gpt-6-astra`.

The current GitHub Pages site is static and cannot run `/api/chat`. The AI chat works on the Vercel deployment (or another host configured to run Vercel-compatible functions). Never put the API key in `index.html`, `js/app.js`, or any other browser-delivered file.
