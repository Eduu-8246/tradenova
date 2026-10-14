export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.DERIV_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "DERIV_CLIENT_ID is missing in Vercel"
    });
  }

  const { code, code_verifier, redirect_uri } = req.body || {};
  const expectedRedirect =
    "https://tradenova-phi.vercel.app/callback";

  if (!code || !code_verifier || redirect_uri !== expectedRedirect) {
    return res.status(400).json({
      error: "Missing code, verifier, or valid redirect URI"
    });
  }

  try {
    const response = await fetch(
      "https://auth.deriv.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          code_verifier,
          redirect_uri: expectedRedirect
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error_description || data.error || "Token exchange failed"
      });
    }

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      error: "Unable to complete OAuth exchange"
    });
  }
}
