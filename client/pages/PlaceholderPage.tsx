import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction, MessageSquare } from "lucide-react";
import Layout from "@/components/Layout";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function PlaceholderPage({ title, description, icon: Icon, color }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {description}
            </p>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-2xl mx-auto">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Construction className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                <CardDescription className="text-lg">
                  We're working hard to bring you this amazing feature
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  This module is currently under development. Our AI engineers are crafting an 
                  exceptional experience that will help you excel in your IELTS preparation.
                </p>
                
                <div className="bg-ielts-blue/5 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg mb-3">What's Coming:</h3>
                  <ul className="text-left space-y-2 text-sm text-muted-foreground">
                    <li>• AI-powered assessment and feedback</li>
                    <li>• Real-time performance tracking</li>
                    <li>• Personalized practice recommendations</li>
                    <li>• Interactive learning experience</li>
                    <li>• Progress analytics and insights</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button asChild className="flex-1">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request This Feature
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Want to be notified when this module is ready?{" "}
                    <Link to="#" className="text-ielts-blue hover:underline font-medium">
                      Join our waitlist
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
