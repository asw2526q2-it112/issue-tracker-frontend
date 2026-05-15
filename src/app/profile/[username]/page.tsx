import { Suspense } from "react";

import { PublicProfileView } from "@/features/users/components/public-profile-view";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <div className="flex flex-1 flex-col p-8">
      <Suspense>
        <PublicProfileView username={username} />
      </Suspense>
    </div>
  );
}
