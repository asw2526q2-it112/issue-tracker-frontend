import { Suspense } from "react";

import { ProfileView } from "@/features/users/components/profile-view";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <Suspense>
        <ProfileView />
      </Suspense>
    </div>
  );
}
