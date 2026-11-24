// NAT IELTS Student Writing Hub - Direct API configuration.
// CAUTION: This file is PUBLIC on GitHub Pages, including the API key below.
// The user explicitly selected browser-side calling and accepted this exposure.
// Default provider is the official Google Gemini REST API.
// If using a provider-issued sk- key, you MAY need to change provider and apiUrl.
// Only the site owner edits this file; students do not enter credentials.
window.NAT_GEMINI_CONFIG = {
  model: 'gemini-3-flash-preview',
  provider: 'openai-compatible', // 'google', 'gemini-gateway', 'openai-compatible'
  apiKey: "sk-NucjEDHOQGAskdBP07f38IFSWTV9U5bM6vkdHPbhCaUlVgJb",
  // For 'gemini-gateway': exact endpoint e.g. https://YOUR_PROVIDER/v1/models/gemini-3-flash-preview:generateContent
  // For 'openai-compatible': exact /chat/completions endpoint.
  apiUrl: 'https://api.routeapi.ai/v1/chat/completions',
  // Only for 'gemini-gateway': 'bearer' or 'x-goog-api-key'
  gatewayAuth: 'bearer'
};
