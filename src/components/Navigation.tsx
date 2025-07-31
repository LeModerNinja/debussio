import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Music, User, LogOut, Library, Calendar, Compass, Search, Bell, Users } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-serif bg-gradient-primary bg-clip-text text-transparent">
                DeBussio
              </span>
              <span className="text-xs text-muted-foreground -mt-1 hidden sm:block">
                Classical Music Companion
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/library" 
                className={`nav-link ${isActivePath('/library') ? 'active' : ''}`}
              >
                <Library className="h-4 w-4" />
                <span>Library</span>
              </Link>
              <Link 
                to="/discover" 
                className={`nav-link ${isActivePath('/discover') ? 'active' : ''}`}
              >
                <Compass className="h-4 w-4" />
                <span>Discover</span>
              </Link>
              <Link 
                to="/concerts" 
                className={`nav-link ${isActivePath('/concerts') ? 'active' : ''}`}
              >
                <Search className="h-4 w-4" />
                <span>Concerts</span>
              </Link>
              <Link 
                to="/calendar" 
                className={`nav-link ${isActivePath('/calendar') ? 'active' : ''}`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <Link 
                to="/community" 
                className={`nav-link ${isActivePath('/community') ? 'active' : ''}`}
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </Link>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Search Button */}
                <Button variant="ghost" size="icon" className="hover-lift">
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="hover-lift relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-background"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover-lift">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-gradient-primary text-primary-foreground font-medium">
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 glass-card" align="end" forceMount>
                    <div className="flex items-center gap-3 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Classical Music Enthusiast</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full">
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/library" className="cursor-pointer w-full">
                        <Library className="mr-3 h-4 w-4" />
                        <span>My Library</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="btn-primary-gradient" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}