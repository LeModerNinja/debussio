// Community page for musicians to connect and find practice partners
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Music, 
  Star, 
  Users, 
  MessageCircle, 
  Calendar,
  Search,
  Filter,
  Heart,
  UserPlus
} from 'lucide-react';

// Mock musician profiles data
const mockMusicians = [
  {
    id: 1,
    name: "Sarah Chen",
    location: "Manhattan, NY",
    instrument: "Violin",
    skill_level: "Professional",
    availability: "Weekday Evenings",
    preferred_genres: ["Chamber Music", "Classical", "Contemporary"],
    experience_years: 15,
    looking_for: "String quartet formation",
    bio: "Professional violinist seeking dedicated musicians for regular chamber music sessions. Experience with Brahms, Dvorak, and Beethoven quartets.",
    avatar: null,
    rating: 4.9,
    reviews: 23,
    rehearsal_space: true,
    teaches: true,
    preferred_duration: "2-3 hours"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    location: "Brooklyn, NY", 
    instrument: "Cello",
    skill_level: "Advanced Amateur",
    availability: "Weekends",
    preferred_genres: ["Baroque", "Classical", "Romantic"],
    experience_years: 8,
    looking_for: "Piano trio or string quartet",
    bio: "Passionate cellist looking for like-minded musicians. I have access to a rehearsal studio in Brooklyn Heights.",
    avatar: null,
    rating: 4.7,
    reviews: 18,
    rehearsal_space: true,
    teaches: false,
    preferred_duration: "1-2 hours"
  },
  {
    id: 3,
    name: "Emma Williams",
    location: "Upper West Side, NY",
    instrument: "Piano",
    skill_level: "Intermediate",
    availability: "Flexible",
    preferred_genres: ["Classical", "Romantic", "Modern"],
    experience_years: 12,
    looking_for: "Chamber music partners",
    bio: "Classical pianist interested in exploring piano duos, trios, and accompanying other instruments. Open to all skill levels.",
    avatar: null,
    rating: 4.8,
    reviews: 31,
    rehearsal_space: false,
    teaches: true,
    preferred_duration: "1-3 hours"
  },
  {
    id: 4,
    name: "David Kim",
    location: "Midtown, NY",
    instrument: "Viola",
    skill_level: "Professional",
    availability: "Weekday Mornings",
    preferred_genres: ["Chamber Music", "Contemporary", "Jazz Fusion"],
    experience_years: 20,
    looking_for: "String quartet or quintet",
    bio: "Freelance violist with orchestral and chamber experience. Looking for serious musicians for regular rehearsals and potential performances.",
    avatar: null,
    rating: 5.0,
    reviews: 15,
    rehearsal_space: true,
    teaches: true,
    preferred_duration: "2-4 hours"
  },
  {
    id: 5,
    name: "Isabella Thompson",
    location: "Greenwich Village, NY",
    instrument: "Flute",
    skill_level: "Advanced Amateur",
    availability: "Evenings",
    preferred_genres: ["Classical", "Baroque", "Film Scores"],
    experience_years: 6,
    looking_for: "Wind quintet or mixed ensemble",
    bio: "Flutist seeking wind players or mixed ensemble opportunities. Particularly interested in Mozart, Bach, and John Williams arrangements.",
    avatar: null,
    rating: 4.6,
    reviews: 12,
    rehearsal_space: false,
    teaches: false,
    preferred_duration: "1-2 hours"
  },
  {
    id: 6,
    name: "Robert Chang",
    location: "Queens, NY",
    instrument: "French Horn",
    skill_level: "Intermediate",
    availability: "Weekend Afternoons",
    preferred_genres: ["Classical", "Romantic", "Modern"],
    experience_years: 10,
    looking_for: "Brass quintet or orchestra",
    bio: "French horn player looking to join or form a brass quintet. Also interested in community orchestra opportunities.",
    avatar: null,
    rating: 4.5,
    reviews: 8,
    rehearsal_space: false,
    teaches: false,
    preferred_duration: "2-3 hours"
  }
];

export default function Community() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [activeTab, setActiveTab] = useState('musicians');

  // Filter musicians based on search criteria
  const filteredMusicians = mockMusicians.filter(musician => {
    return (
      musician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      musician.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      musician.looking_for.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (locationFilter === '' || locationFilter === 'all' || musician.location.includes(locationFilter)) &&
    (instrumentFilter === '' || instrumentFilter === 'all' || musician.instrument === instrumentFilter) &&
    (skillFilter === '' || skillFilter === 'all' || musician.skill_level === skillFilter);
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'Professional': return 'bg-green-100 text-green-800';
      case 'Advanced Amateur': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <section className="py-12 px-4 bg-gradient-subtle">
        <div className="content-container text-center">
          <h1 className="text-4xl font-bold mb-4">
            Connect with Fellow Musicians
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find practice partners, form ensembles, and build musical communities in your area. 
            Connect with musicians who share your passion for classical music.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Musicians</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Ensembles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Practice Spaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">NYC</div>
              <div className="text-sm text-muted-foreground">Local Area</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="content-container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="musicians">Find Musicians</TabsTrigger>
              <TabsTrigger value="ensembles">Join Ensembles</TabsTrigger>
              <TabsTrigger value="spaces">Practice Spaces</TabsTrigger>
            </TabsList>

            <TabsContent value="musicians" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Your Musical Match
                  </CardTitle>
                  <CardDescription>
                    Search for musicians based on instrument, skill level, and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Name, instrument, or ensemble type..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any location</SelectItem>
                          <SelectItem value="Manhattan">Manhattan</SelectItem>
                          <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                          <SelectItem value="Queens">Queens</SelectItem>
                          <SelectItem value="Bronx">Bronx</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instrument</label>
                      <Select value={instrumentFilter} onValueChange={setInstrumentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any instrument</SelectItem>
                          <SelectItem value="Violin">Violin</SelectItem>
                          <SelectItem value="Viola">Viola</SelectItem>
                          <SelectItem value="Cello">Cello</SelectItem>
                          <SelectItem value="Piano">Piano</SelectItem>
                          <SelectItem value="Flute">Flute</SelectItem>
                          <SelectItem value="French Horn">French Horn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Skill Level</label>
                      <Select value={skillFilter} onValueChange={setSkillFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any level</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Advanced Amateur">Advanced Amateur</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Musicians Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMusicians.map((musician) => (
                  <Card key={musician.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={musician.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                              {getInitials(musician.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{musician.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {musician.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Instrument and Skill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-primary" />
                          <span className="font-medium">{musician.instrument}</span>
                        </div>
                        <Badge className={`text-xs ${getSkillColor(musician.skill_level)}`}>
                          {musician.skill_level}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{musician.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({musician.reviews} reviews)</span>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{musician.availability}</span>
                      </div>

                      {/* Looking For */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Looking for:</div>
                        <div className="text-sm text-muted-foreground">{musician.looking_for}</div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground line-clamp-3">{musician.bio}</p>

                      {/* Preferred Genres */}
                      <div className="flex flex-wrap gap-1">
                        {musician.preferred_genres.slice(0, 3).map((genre, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>

                      {/* Additional Info */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {musician.rehearsal_space && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            Has space
                          </span>
                        )}
                        {musician.teaches && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Teaches
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="default" size="sm" className="flex-1">
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredMusicians.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No musicians found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or check back later for new members.
                    </p>
                    <Button variant="outline">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ensembles" className="space-y-6">
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ensemble Matching Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    We're working on a feature to help you find and join existing ensembles in your area.
                  </p>
                  <Button variant="outline">
                    Get Notified
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spaces" className="space-y-6">
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Practice Space Booking Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Soon you'll be able to discover and book rehearsal spaces in your area through our platform.
                  </p>
                  <Button variant="outline">
                    List Your Space
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}