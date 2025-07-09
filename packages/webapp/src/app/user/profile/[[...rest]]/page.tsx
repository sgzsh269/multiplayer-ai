import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <UserProfile />
    </div>
  );
}
