import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Clock, Users, MessageCircle, Brain, CheckCircle, Star } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Heart,
      title: "Empathetic AI",
      description: "Our AI is trained to understand and respond with genuine empathy and care.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your conversations are encrypted and completely confidential.",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get support whenever you need it, day or night.",
    },
    {
      icon: Brain,
      title: "Evidence-Based",
      description: "Built on proven therapeutic techniques and mental health research.",
    },
    {
      icon: MessageCircle,
      title: "Natural Conversations",
      description: "Chat naturally as if you're talking to a trusted friend.",
    },
    {
      icon: Users,
      title: "Personalized Support",
      description: "Tailored responses based on your unique needs and preferences.",
    },
  ]

  const benefits = [
    "Reduce anxiety and stress through guided conversations",
    "Develop coping strategies for daily challenges",
    "Practice mindfulness and emotional regulation",
    "Explore your thoughts and feelings in a safe space",
    "Build self-awareness and emotional intelligence",
    "Access support during difficult moments",
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      text: "Harmoni AI has been a game-changer for my mental health. Having someone to talk to anytime has made such a difference.",
      rating: 5,
    },
    {
      name: "David L.",
      text: "I was skeptical at first, but the AI really understands me. It's like having a therapist in my pocket.",
      rating: 5,
    },
    {
      name: "Emma R.",
      text: "The privacy and convenience are unmatched. I can be completely honest without any judgment.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Harmoni AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/help">
                <Button variant="ghost">Help</Button>
              </Link>
              <Link href="/login?tab=login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/login?tab=signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI Therapist,
            <span className="text-indigo-600 block">Always Here to Listen</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience compassionate, AI-powered mental health support available 24/7. Get the emotional support you
            need, when you need it, in complete privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?tab=signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Harmoni AI?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combining cutting-edge AI technology with evidence-based therapeutic approaches
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to better mental health</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account in seconds and set your preferences</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Chatting</h3>
              <p className="text-gray-600">Begin your conversation with our empathetic AI therapist</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Feel Better</h3>
              <p className="text-gray-600">Experience improved mental well-being through regular support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What You'll Gain</h2>
            <p className="text-xl text-indigo-100">Real benefits for your mental health and well-being</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-white">
                <CheckCircle className="h-6 w-6 text-indigo-200 mr-3 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from people who found support</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people who have found support and healing through Harmoni AI
          </p>
          <Link href="/login?tab=signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
              Get Started Today
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free to start • No credit card required • Complete privacy guaranteed
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Harmoni AI</h3>
              <p className="text-gray-300">Your AI therapist, always here to listen.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Crisis Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Harmoni AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
