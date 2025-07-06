import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Brain,
  Upload,
  Zap,
  Shield,
  MessageSquare,
  FileText,
  Globe,
  ArrowRight,
  CheckCircle,
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
              AI Playground
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <a
              href="#features"
              className="text-xs text-neutral-600 hover:text-neutral-900"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-xs text-neutral-600 hover:text-neutral-900"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              className="text-xs text-neutral-600 hover:text-neutral-900"
            >
              Pricing
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

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge
            variant="secondary"
            className="mb-3 bg-green-100 text-green-700 border-green-200 text-xs"
          >
            🚀 Now in Beta
          </Badge>
          <h1 className="text-3xl md:text-4xl font-medium text-neutral-900 mb-4 leading-tight">
            Multi-User Collaborative AI Playground
          </h1>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed max-w-2xl mx-auto">
            Enable teams to collaboratively interact with advanced AI in
            real-time. Foster group learning, brainstorming, research, and
            decision-making through an intuitive conversational interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Button
              asChild
              size="sm"
              className="bg-green-700 hover:bg-green-800 text-white text-xs px-4 py-2"
            >
              <Link href="/sign-up">
                Start Collaborating
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs px-4 py-2"
            >
              <Link href="/sign-in">Watch Demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Enterprise ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4 border-t border-neutral-200">
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

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-12 px-4 border-t border-neutral-200 bg-neutral-50"
      >
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-neutral-900 mb-2">
              Transform How Your Team Works
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto">
              Unlock new possibilities for collaborative knowledge work and
              problem-solving
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    Enhanced Brainstorming
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Generate ideas collectively with AI assistance, building on
                    each other's thoughts in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    Accelerated Research
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Collaborate on research projects with AI that can access and
                    analyze real-time data sources.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    Team Learning
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Learn together as a group, with AI providing explanations
                    and insights tailored to your team's needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900 mb-1">
                    Better Decision Making
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Make informed decisions with AI-powered analysis and
                    multiple perspectives from your team.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background border border-neutral-200 p-4">
              <div className="bg-neutral-50 border border-neutral-200 p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-700 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">SC</span>
                  </div>
                  <span className="text-xs font-medium text-neutral-900">
                    Sarah Chen
                  </span>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Online
                  </Badge>
                </div>
                <div className="bg-background border border-neutral-200 p-2 mb-2">
                  <p className="text-xs text-neutral-700">
                    "Can we analyze the market trends for Q4?"
                  </p>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-green-700 flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-neutral-600">
                    AI Assistant
                  </span>
                </div>
                <div className="bg-neutral-100 border border-neutral-200 p-2 mb-2">
                  <p className="text-xs text-neutral-700">
                    "I'll analyze the latest market data. Here are the key
                    trends I'm seeing..."
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-700 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">MR</span>
                  </div>
                  <span className="text-xs font-medium text-neutral-900">
                    Mike Rodriguez
                  </span>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Typing...
                  </Badge>
                </div>
              </div>
              <p className="text-center text-neutral-600 text-xs">
                Real-time collaboration in action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 border-t border-neutral-200 bg-green-700">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-medium text-white mb-3">
            Ready to Transform Your Team's Collaboration?
          </h2>
          <p className="text-sm text-green-100 mb-6 max-w-xl mx-auto">
            Join teams already using AI Playground to enhance their
            collaborative work and decision-making processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Button
              size="sm"
              variant="secondary"
              className="text-xs px-4 py-2 bg-background text-green-700 hover:bg-neutral-100"
            >
              Start Free Trial
              <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-4 py-2 border-white text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-green-200 text-xs mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-green-700 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  AI Playground
                </span>
              </div>
              <p className="text-neutral-400 text-xs">
                Empowering teams to collaborate with AI for better outcomes.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white mb-2">Product</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white mb-2">Company</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white mb-2">Support</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-6 pt-6 text-center text-xs text-neutral-400">
            <p>&copy; 2024 AI Playground. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
