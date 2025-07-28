import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Calendar, Users, Star, Play, Plus, Heart, BookOpen, Filter } from "lucide-react";
import heroImage from "@/assets/hero-concert-hall.jpg";
import conductorImage from "@/assets/conductor-hero.jpg";
import conductorBackground from "@/assets/conductor-background.png";

const Index = () => {
  const [showLogRecording, setShowLogRecording] = useState(false);
  const [showLogConcert, setShowLogConcert] = useState(false);
  const { user } = useAuth();

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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-0 px-4 overflow-hidden min-h-[80vh] flex items-end">
        {/* Background Image with Fade */}
        <div className="absolute inset-0 z-0">
          <img 
            src={conductorBackground} 
            alt="Conductor conducting orchestra" 
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.4) contrast(1.2)' }}
          />
          {/* Gradient overlay for fade effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
        </div>
        
        <div className="content-container relative z-10 text-center w-full pb-24">
          {/* Elegant Separator Line */}
          <div className="w-24 h-px bg-primary/30 mx-auto mb-8"></div>
          
          {/* Updated Title - More Eloquent with Full Stops */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed mb-6 max-w-4xl mx-auto text-white">
            Chronicle your musical encounters and cherished recordings.
          </h1>
          
          {/* Elegant Separator */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-px bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-white/30 mx-4"></div>
            <div className="w-16 h-px bg-white/20"></div>
          </div>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed mb-6 max-w-4xl mx-auto text-white/90">
            Discover extraordinary performances in your vicinity.
          </h2>
          
          {/* Elegant Separator */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-px bg-white/15"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/25 mx-3"></div>
            <div className="w-12 h-px bg-white/15"></div>
          </div>
          
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed mb-12 max-w-4xl mx-auto text-white/80">
            Unite with fellow musicians and create harmonious ensembles.
          </h3>
          
          {/* Elegant Bottom Separator */}
          <div className="w-32 h-px bg-white/20 mx-auto mb-8"></div>
          
          <p className="text-sm italic opacity-60 mb-16 text-white/70">
            DeBussio is fully open source and free to use.
          </p>
          
          {/* Unified Two-Sided Button */}
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center">
              {/* Single Button with Two Colored Sides */}
              <div className="relative overflow-hidden rounded-2xl shadow-elegant border border-border/20">
                <div className="flex">
                  {/* Left Side - Brown (Log Recording) */}
                  <Button 
                    variant="ghost"
                    className="h-20 px-12 text-xl font-semibold rounded-none border-0 bg-amber-800 text-white hover:bg-amber-700 transition-all duration-300 hover:scale-105 group"
                    onClick={() => setShowLogRecording(!showLogRecording)}
                  >
                    <Music className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform" />
                    Log Recording
                  </Button>
                  
                  {/* Right Side - White (Log Concert) */}
                  <Button 
                    variant="ghost"
                    className="h-20 px-12 text-xl font-semibold rounded-none border-0 bg-white text-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 group border-l border-border/30"
                    onClick={() => setShowLogConcert(!showLogConcert)}
                  >
                    <Calendar className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform" />
                    Log Concert
                  </Button>
                </div>
              </div>
            </div>

            {/* Log Recording Interface */}
            {showLogRecording && (
              <div className="w-full p-8 bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 space-y-4 animate-fade-in">
                <h3 className="text-2xl font-semibold">Log a Recording</h3>
                <div className="space-y-4">
                  <Input placeholder="Composer (e.g., Bach, Mozart)" className="h-12 text-lg" />
                  <Input placeholder="Piece (e.g., Symphony No. 9, Brandenburg Concerto)" className="h-12 text-lg" />
                  <Input placeholder="Performer/Orchestra" className="h-12 text-lg" />
                  <Input placeholder="Conductor" className="h-12 text-lg" />
                  <div className="flex gap-4 pt-4">
                    <Button variant="default" size="lg" className="h-12 px-8">Save Recording</Button>
                    <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setShowLogRecording(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Log Concert Interface */}
            {showLogConcert && (
              <div className="w-full p-8 bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 space-y-4 animate-fade-in">
                <h3 className="text-2xl font-semibold">Log a Concert</h3>
                <div className="space-y-4">
                  <Input placeholder="Concert/Performance Title" className="h-12 text-lg" />
                  <Input placeholder="Venue" className="h-12 text-lg" />
                  <Input placeholder="Date" type="date" className="h-12 text-lg" />
                  <Input placeholder="Orchestra/Ensemble" className="h-12 text-lg" />
                  <Input placeholder="Conductor" className="h-12 text-lg" />
                  <Input placeholder="Program/Pieces Performed" className="h-12 text-lg" />
                  <div className="flex gap-4 pt-4">
                    <Button variant="default" size="lg" className="h-12 px-8">Save Concert</Button>
                    <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setShowLogConcert(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Action Buttons - Smaller with Different Color Scheme */}
          <div className="flex flex-wrap justify-center gap-4 mt-20">
            <Button variant="outline" size="default" className="h-12 px-6 text-base border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/50">
              <Calendar className="h-5 w-5 mr-2" />
              Discover Concerts
            </Button>
            <Button variant="secondary" size="default" className="h-12 px-6 text-base">
              <Users className="h-5 w-5 mr-2" />
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
