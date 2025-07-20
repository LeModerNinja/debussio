import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Calendar, Users, Star, Play, Plus, Heart, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-concert-hall.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredRecordings = [
    {
      id: 1,
      title: "Symphony No. 9 in D minor",
      composer: "Ludwig van Beethoven",
      conductor: "Herbert von Karajan",
      orchestra: "Berlin Philharmonic",
      year: "1962",
      rating: 4.8,
      reviews: 1247
    },
    {
      id: 2,
      title: "Piano Concerto No. 1 in B-flat minor",
      composer: "Pyotr Ilyich Tchaikovsky",
      conductor: "Claudio Abbado",
      orchestra: "Vienna Philharmonic",
      year: "1989",
      rating: 4.7,
      reviews: 892
    },
    {
      id: 3,
      title: "The Four Seasons",
      composer: "Antonio Vivaldi",
      conductor: "Nigel Kennedy",
      orchestra: "English Chamber Orchestra",
      year: "1989",
      rating: 4.6,
      reviews: 1156
    }
  ];

  const upcomingConcerts = [
    {
      id: 1,
      title: "Mahler Symphony No. 5",
      venue: "Carnegie Hall",
      date: "March 15, 2024",
      conductor: "Gustavo Dudamel",
      orchestra: "Los Angeles Philharmonic"
    },
    {
      id: 2,
      title: "Mozart Piano Concerto No. 23",
      venue: "Royal Albert Hall",
      date: "March 18, 2024",
      conductor: "Simon Rattle",
      orchestra: "London Symphony Orchestra"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DeBussio</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Discover</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Concerts</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Community</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">My Library</a>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">Sign In</Button>
              <Button variant="hero" size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Concert Hall" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero"></div>
        </div>
        
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Your Classical Music
            <span className="block text-primary">Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover, log, and share your classical music experiences. From recordings to concerts, 
            build your musical story with fellow enthusiasts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search composers, pieces, conductors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card/80 backdrop-blur-sm border-border"
              />
            </div>
            <Button variant="hero" size="lg" className="whitespace-nowrap">
              <Search className="h-4 w-4 mr-2" />
              Explore Music
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="elegant" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Log a Recording
            </Button>
            <Button variant="elegant" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Find Concerts
            </Button>
            <Button variant="elegant" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Recordings */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Featured Recordings</h3>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecordings.map((recording) => (
              <Card key={recording.id} className="group hover:shadow-elegant transition-all duration-300 bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-6 mb-2">{recording.title}</CardTitle>
                      <CardDescription className="text-primary font-medium">{recording.composer}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">{recording.conductor}</p>
                    <p className="text-sm text-muted-foreground">{recording.orchestra}</p>
                    <Badge variant="secondary">{recording.year}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{recording.rating}</span>
                      <span className="text-sm text-muted-foreground">({recording.reviews})</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Upcoming Concerts</h3>
            <Button variant="ghost">View Calendar</Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingConcerts.map((concert) => (
              <Card key={concert.id} className="hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{concert.title}</CardTitle>
                      <CardDescription className="text-primary font-medium">{concert.venue}</CardDescription>
                    </div>
                    <Badge variant="outline">{concert.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-muted-foreground">{concert.conductor}</p>
                    <p className="text-sm text-muted-foreground">{concert.orchestra}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="default" size="sm">Book Tickets</Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-foreground mb-12">Everything You Need for Classical Music</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Music Logging</h4>
              <p className="text-muted-foreground">Track recordings, performances, and personal notes. Build your classical music diary.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Concert Discovery</h4>
              <p className="text-muted-foreground">Find concerts worldwide with AI-powered recommendations and affiliate booking.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Musician Community</h4>
              <p className="text-muted-foreground">Connect with local musicians, find practice partners, and join ensembles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Music className="h-6 w-6" />
                <h4 className="text-lg font-bold">DeBussio</h4>
              </div>
              <p className="text-primary-foreground/80">Your classical music companion for discoveries, logging, and community.</p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Discover</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Recordings</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Composers</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Conductors</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Orchestras</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Connect</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Concerts</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Musicians</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Events</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 DeBussio. Elevating classical music experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
