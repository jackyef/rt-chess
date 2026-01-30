export const assertIdentity = (req: Bun.BunRequest) => {
  if (!req.cookies.get('rt-chess-identity')) {
    console.error('Unauthorized: Missing identity cookie')

    return new Response("Unauthorized", { status: 401 })
  }
}
