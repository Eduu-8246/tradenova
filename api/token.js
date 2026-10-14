export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const clientId = process.env.DERIV_CLIENT_ID;
const clientSecret = process.env.DERIV_CLIENT_SECRET;

if (!clientId || !clientSecret) {
return res.status(500).json({
error: "OAuth server configuration is incomplete"
});
}

const { code, redirect_uri } = req.body || {};

if (!code || !redirect_uri) {
return res.status(400).json({
error: "Missing authorization code or redirect URI"
});
}

const expectedRedirect =
"https://tradenova.vercel.app/callback";

if (redirect_uri !== expectedRedirect) {
return res.status(400).json({
error: "Invalid redirect URI"
});
}

try {
const response = await fetch(
"https://api.deriv.com/oauth2/token",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
grant_type: "authorization_code",
code,
redirect_uri,
client_id: clientId,
client_secret: clientSecret
})
}
);

const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json({
    error: "OAuth exchange failed"
  });
}

return res.status(200).json(data);

} catch {
return res.status(500).json({
error: "Unable to complete OAuth exchange"
});
}
}
