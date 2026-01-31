export const identityRoutes = {
  "GET": (req: Bun.BunRequest) => {
    const identity = req.cookies.get("rt-chess-identity");
    return Response.json({ identity: identity || '' });
  },
  "PUT": async (req: Bun.BunRequest) => {
    const { identity } = await req.json();

    // Access request cookies
    const cookies = req.cookies;
    // Used to determine player id, which side they are playing, etc.
    // On an actual app, this will be much more secure, like an actual email with proper auth.
    cookies.set("rt-chess-identity", identity);

    // Just echo back the identity
    return Response.json({ identity });
  }
}
