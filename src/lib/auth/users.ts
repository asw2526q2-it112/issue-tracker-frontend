/**
 * Hardcoded user list for the Phase 3 demo.
 *
 * The professor's requirement: no login flow — instead, a dropdown lets you
 * pick which user "you are", and every API request uses that user's DRF token.
 *
 * How to mint a token:
 *   1. Log into the Django app via Google OAuth.
 *   2. Hit `POST /api/me/token/rotate/` (use the Swagger UI at /api/docs/).
 *   3. Copy the returned token here.
 * Or, from the Django shell:
 *   from rest_framework.authtoken.models import Token
 *   from users.models import User
 *   Token.objects.get_or_create(user=User.objects.get(username="..."))
 */
export type HardcodedUser = {
  /** Stable id used as the localStorage key — pick anything unique, e.g. username. */
  id: string;
  username: string;
  displayName: string;
  email: string;
  /** DRF token for this user — see file docstring for how to mint one. */
  token: string;
  /** Optional avatar URL. Falls back to the user's initials. */
  avatarUrl?: string;
};

export const USERS: readonly HardcodedUser[] = [
  {
    id: "pol",
    username: "pol",
    displayName: "Pol Nebot",
    email: "pol@example.com",
    token: "1635d0d087aca7f320b0af03ea56121713fc9a57",
  },
  {
    id: "oriol",
    username: "oriol",
    displayName: "Oriol Berruezo",
    email: "oriol@example.com",
    token: "070a1c0deb5c1d21b2502e126f4f522909f6db38",
  },
  {
    id: "llorenc",
    username: "llorenc",
    displayName: "Llorenç Codinach",
    email: "llorenc@example.com",
    token: "80d346db1e180563ad24717cbb44f6db0b31ae89",
  },
  {
    id: "gabriel",
    username: "gabriel",
    displayName: "Gabriel Escobar",
    email: "gabriel@example.com",
    token: "ec6f2a07335b04e2be9e697451c9cf0ff54267d4",
  },
] as const;
