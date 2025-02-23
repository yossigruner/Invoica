import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/utils/logger";

export const UserAvatar = () => {
  const navigate = useNavigate();
  const { signOut, isLoading } = useAuth();
  const { profile, loading } = useProfile();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return '?';
    
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          <AvatarFallback className="bg-primary/5">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-offset-background transition-all hover:bg-primary/5 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-semibold">
              {getInitials(profile?.first_name, profile?.last_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 mt-2" align="end">
        <div className="flex items-center gap-3 p-2 mb-2">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-semibold">
              {getInitials(profile?.first_name, profile?.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            {profile?.first_name && profile?.last_name && (
              <p className="text-sm font-medium text-gray-700">{`${profile.first_name} ${profile.last_name}`}</p>
            )}
            {profile?.email && (
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                {profile.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => { navigate("/profile"); }}
          className="py-2.5 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors group"
        >
          <User className="mr-3 h-4 w-4 text-primary group-hover:text-primary" />
          <span className="text-gray-600 group-hover:text-gray-900">Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => { navigate("/billing"); }}
          className="py-2.5 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 transition-colors group"
        >
          <CreditCard className="mr-3 h-4 w-4 text-primary group-hover:text-primary" />
          <span className="text-gray-600 group-hover:text-gray-900">Billing</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoading}
          className="py-2.5 cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-colors text-red-600 hover:text-red-600 group disabled:opacity-50"
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:text-red-600" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
