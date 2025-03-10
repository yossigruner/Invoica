
import { UserRound } from "lucide-react";

export const ProfileHeader = () => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <UserRound className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information</p>
      </div>
    </div>
  );
};
