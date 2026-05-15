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
    token: "4a0acd24b4d0ee707ca8611769f6ef18574a4cf7",
  },
  {
    id: "oriol",
    username: "oriol",
    displayName: "Oriol Berruezo",
    token: "e5531b687af9488708488c0ad0f7658ae3cd472c",
  },
  {
    id: "llorenc",
    username: "llorenc",
    displayName: "Llorenç Codinach",
    token: "fdc6b0a619703e6ddde951d45dfba0ae0156b0e9",
  },
  {
    id: "gabriel",
    username: "gabriel",
    displayName: "Gabriel Escobar",
    token: "6405648ed2f699afcde302c45227af381edc8d1a",
  },
] as const;
