import { FloatingNav } from "@/components/ui/floating-navbar";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Spotlight } from "@/components/ui/spotlight";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, User, Settings } from "lucide-react";

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <User className="h-4 w-4" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <Settings className="h-4 w-4" />,
  },
];

function App() {
  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Spotlight Effect */}
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      {/* Floating Navigation */}
      <FloatingNav navItems={navItems} />
      
      {/* Main Content */}
      <div className="relative z-10 w-full pt-20">
        <div className="max-w-7xl mx-auto p-4">
          {/* Hero Section */}
          <div className="text-center pt-20 pb-10">
            <TextGenerateEffect 
              words="Welcome to Aceternity UI with Vite" 
              className="text-center text-[40px] md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-white relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white"
            />
            <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-20">
              Experience the power of modern UI components with smooth animations and beautiful designs.
            </p>
          </div>
          
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
            <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Beautiful Components</CardTitle>
                <CardDescription>
                  Crafted with attention to detail and modern design principles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Smooth Animations</CardTitle>
                <CardDescription>
                  Powered by Framer Motion for fluid and engaging interactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Demos
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Developer Friendly</CardTitle>
                <CardDescription>
                  Built with TypeScript, fully customizable and easy to integrate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
