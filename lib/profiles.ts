import { getCloudflareContext } from "@opennextjs/cloudflare";

export type UserProfileDetails = {
  city: string | null;
  bio: string | null;
};

const EMPTY_PROFILE: UserProfileDetails = {
  city: null,
  bio: null,
};

export async function getUserProfileDetails(
  userId: string,
): Promise<UserProfileDetails> {
  const { env } = await getCloudflareContext({ async: true });
  const profile = await env.DB.prepare(
    `SELECT city, bio FROM user_profiles WHERE user_id = ? LIMIT 1`,
  )
    .bind(userId)
    .first<UserProfileDetails>();

  return profile ?? EMPTY_PROFILE;
}
