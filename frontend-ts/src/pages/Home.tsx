import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Truck,
  Route,
  BarChart3,
  Users,
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Star,
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Driver Management',
      description: 'Efficiently manage your delivery drivers with comprehensive tracking and assignment tools.',
    },
    {
      icon: Route,
      title: 'Route Optimization',
      description: 'Optimize delivery routes to reduce costs and improve efficiency using advanced algorithms.',
    },
    {
      icon: Package,
      title: 'Order Tracking',
      description: 'Real-time order tracking and status updates for complete delivery visibility.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting tools to track performance and identify improvements.',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant updates on delivery status, driver locations, and route changes.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Insights',
      description: 'Detailed insights into delivery performance, efficiency metrics, and optimization opportunities.',
    },
  ];

  const stats = [
    { label: 'Active Drivers', value: '150+', icon: Users },
    { label: 'Deliveries Completed', value: '10,000+', icon: CheckCircle },
    { label: 'Routes Optimized', value: '500+', icon: Route },
    { label: 'Customer Satisfaction', value: '98%', icon: Star },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Modern Delivery Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Streamline Your
            <span className="text-primary"> Delivery Operations</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            GreenCart provides a comprehensive solution for managing drivers, optimizing routes, 
            and tracking deliveries with real-time analytics and performance insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Delivery Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to manage your delivery operations efficiently and effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Optimize Your Deliveries?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses who trust GreenCart to manage their delivery operations. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/simulation">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
