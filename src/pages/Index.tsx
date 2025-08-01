import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { LogEntryForm } from '@/components/common/LogEntryForm';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Music, Calendar, Users, Star, BookOpen, Database, Heart, Play } from "lucide-react";
import { generateTestData } from '@/utils/testDataGenerator';
import { toast } from "sonner";
import heroImage from "@/assets/hero-concert-hall.jpg";

const Index = () => {
  const [showLogRecording, setShowLogRecording] = useState(false);
  const [showLogConcert, setShowLogConcert] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Function to handle test data generation with user feedback
  const handleGenerateTestData = async () => {
    console.log('Test data generation button clicked');
    console.log('User:', user);
    
    if (!user) {
      toast.error("Please log in first to generate test data");
      return;
    }
    
    try {
      toast.info("Generating test data...");
      console.log('Starting test data generation...');
      await generateTestData();
      toast.success("Test data generated successfully! Check your Library page.");
      console.log('Test data generation completed');
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error(`Failed to generate test data: ${error.message || 'Unknown error'}`);
    }
  };
  const featuredRecordings = [{
    id: 1,
    title: "Symphony No. 9 in D minor",
    composer: "Ludwig van Beethoven",
    conductor: "Herbert von Karajan",
    orchestra: "Berlin Philharmonic",
    year: "1962",
    rating: 4.8,
    reviews: 1247
  }, {
    id: 2,
    title: "Piano Concerto No. 1 in B-flat minor",
    composer: "Pyotr Ilyich Tchaikovsky",
    conductor: "Claudio Abbado",
    orchestra: "Vienna Philharmonic",
    year: "1989",
    rating: 4.7,
    reviews: 892
  }, {
    id: 3,
    title: "The Four Seasons",
    composer: "Antonio Vivaldi",
    conductor: "Nigel Kennedy",
    orchestra: "English Chamber Orchestra",
    year: "1989",
    rating: 4.6,
    reviews: 1156
  }];
  const upcomingConcerts = [{
    id: 1,
    title: "Mahler Symphony No. 5",
    venue: "Carnegie Hall",
    date: "March 15, 2024",
    conductor: "Gustavo Dudamel",
    orchestra: "Los Angeles Philharmonic"
  }, {
    id: 2,
    title: "Mozart Piano Concerto No. 23",
    venue: "Royal Albert Hall",
    date: "March 18, 2024",
    conductor: "Simon Rattle",
    orchestra: "London Symphony Orchestra"
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Concert Hall" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-hero"></div>
        </div>
        
        <div className="content-container relative z-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-8">
            <span className="block">Log your recent concerts and favourite recordings.</span>
            <span className="block">Find the next concert in your area.</span>
            <span className="block">Connect with like-minded people and play in ensembles.</span>
          </h1>
          
          <p className="text-sm italic opacity-75 mb-12 text-center">
            DeBussio is fully open source and free to use.
          </p>
          
          {/* Logging Actions */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center">
              {/* Combined Log Button */}
              <div className="relative overflow-hidden rounded-xl shadow-elegant">
                <div className="flex">
                  {/* Left Side - Log Recording (Brown) */}
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="h-20 px-12 text-xl bg-amber-800 text-white hover:bg-amber-700 rounded-r-none border-r border-amber-600" 
                    onClick={() => {
                      if (!user) {
                        // Redirect to auth if not logged in
                        navigate('/auth');
                        return;
                      }
                      setShowLogRecording(true);
                    }}
                  >
                    <Music className="h-7 w-7 mr-3" />
                    Log Recording
                  </Button>
                  {/* Right Side - Log Concert (White) */}
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-20 px-12 text-xl bg-white text-foreground hover:bg-gray-50 rounded-l-none border-l border-gray-200" 
                    onClick={() => {
                      if (!user) {
                        // Redirect to auth if not logged in  
                        navigate('/auth');
                        return;
                      }
                      setShowLogConcert(true);
                    }}
                  >
                    <Calendar className="h-7 w-7 mr-3" />
                    Log Concert
                  </Button>
                </div>
              </div>
            </div>

            {/* Log Recording Dialog */}
            <Dialog open={showLogRecording} onOpenChange={setShowLogRecording}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogTitle>Log Recording</DialogTitle>
                <DialogDescription>Add a new recording to your music library</DialogDescription>
                <LogEntryForm 
                  type="recording" 
                  onSuccess={() => setShowLogRecording(false)} 
                />
              </DialogContent>
            </Dialog>

            {/* Log Concert Dialog */}
            <Dialog open={showLogConcert} onOpenChange={setShowLogConcert}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogTitle>Log Concert</DialogTitle>
                <DialogDescription>Add a new concert experience to your collection</DialogDescription>
                <LogEntryForm 
                  type="concert" 
                  onSuccess={() => setShowLogConcert(false)} 
                />
              </DialogContent>
            </Dialog>

            {/* Test Data Generation Button (Development Only) */}
            {user && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground mb-3">
                  Development Tool: Generate sample data for testing
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateTestData}
                  className="text-sm"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Generate Test Data
                </Button>
              </div>
            )}
          </div>

          {/* Main Action Buttons - More Prominent */}
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            {user ? (
              <>
                <Button variant="hero" size="lg" className="h-16 px-10 text-lg hover-lift shadow-elegant" asChild>
                  <Link to="/calendar">
                    <Calendar className="h-6 w-6 mr-3" />
                    View Calendar
                  </Link>
                </Button>
                <Button variant="elegant" size="lg" className="h-16 px-10 text-lg hover-lift shadow-elegant" asChild>
                  <Link to="/library">
                    <Users className="h-6 w-6 mr-3" />
                    My Library
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" className="h-16 px-10 text-lg hover-lift shadow-elegant" asChild>
                  <Link to="/calendar">
                    <Calendar className="h-6 w-6 mr-3" />
                    View Calendar
                  </Link>
                </Button>
                <Button variant="elegant" size="lg" className="h-16 px-10 text-lg hover-lift shadow-elegant" asChild>
                  <Link to="/auth">
                    <Users className="h-6 w-6 mr-3" />
                    Join Community
                  </Link>
                </Button>
              </>
            )}
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
            {featuredRecordings.map(recording => <Card key={recording.id} className="group hover:shadow-elegant transition-all duration-300 bg-gradient-card border-border">
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
              </Card>)}
          </div>
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Upcoming Concerts</h3>
            <Button variant="ghost" asChild>
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingConcerts.map(concert => <Card key={concert.id} className="hover:shadow-elegant transition-all duration-300">
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
              </Card>)}
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
    </div>;
};
export default Index;