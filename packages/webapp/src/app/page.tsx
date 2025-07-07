import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Brain,
  Upload,
  Zap,
  Shield,
  MessageSquare,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-700 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-neutral-900">
              Multiplayer AI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <a
              href="#features"
              className="text-xs text-neutral-600 hover:text-neutral-900"
            >
              Features
            </a>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-neutral-900 mb-2">
              Powerful Collaborative Features
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto">
              Everything your team needs to work together with AI effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-green-100 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-green-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Real-Time Collaboration
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  Multiple users can interact with AI simultaneously, seeing
                  each other's contributions in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-blue-100 flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4 text-blue-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  File & Image Uploads
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  Seamlessly share and reference documents, images, and other
                  files within your collaborative sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-indigo-100 flex items-center justify-center mb-2">
                  <Globe className="w-4 h-4 text-indigo-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Real-Time Data Access
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  AI can access external APIs and real-time data sources to
                  provide up-to-date information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-orange-100 flex items-center justify-center mb-2">
                  <MessageSquare className="w-4 h-4 text-orange-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Conversational Interface
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  Intuitive chat-based interaction that feels natural and
                  encourages team participation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-red-100 flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4 text-red-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Secure & Private
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  Enterprise-grade security ensures your team's conversations
                  and data remain protected
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-neutral-200 bg-background">
              <CardHeader className="p-3">
                <div className="w-8 h-8 bg-purple-100 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4 text-purple-700" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Advanced AI Tools
                </CardTitle>
                <CardDescription className="text-xs text-neutral-600">
                  Access to cutting-edge AI models and specialized tools for
                  research, analysis, and creativity
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
