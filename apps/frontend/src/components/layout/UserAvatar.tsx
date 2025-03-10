import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function UserAvatar() {
  const { logout } = useAuth();
  const { profile, isLoading } = useProfile();

  const getInitials = () => {
    if (!profile?.firstName && !profile?.lastName) {
      return null;
    }
    
    const firstInitial = profile.firstName ? profile.firstName.charAt(0) : '';
    const lastInitial = profile.lastName ? profile.lastName.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  if (isLoading) {
    return (
      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#8B5CF6]">
          <span className="text-[14px] font-medium text-white">...</span>
        </div>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#8B5CF6]">
            {getInitials() ? (
              <span className="text-[14px] font-medium text-white">
                {getInitials()}
              </span>
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex-col items-start">
          <div className="text-xs font-medium">Signed in as</div>
          <div className="text-xs text-muted-foreground">
            {profile?.firstName && profile?.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : profile?.email}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
