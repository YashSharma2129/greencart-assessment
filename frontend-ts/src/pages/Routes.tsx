import React, { useState } from 'react';
import { useRoutes } from '../hooks/useRoutes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Route,
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  Search,
  Calculator,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import type { Route as RouteType, CreateRouteInput } from '../types';

const Routes: React.FC = () => {
  const { routes, loading, error, createRoute, updateRoute, deleteRoute } = useRoutes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState<CreateRouteInput>({
    routeId: '',
    routeName: '',
    startLocation: '',
    endLocation: '',
    distance: 0,
    trafficLevel: 'Low' as const,
    baseTime: 0,
    estimatedTime: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  const filteredRoutes = routes.filter(route => {
    if (!route || !route.routeName || !route.startLocation || !route.endLocation) {
      return false;
    }
    
    const matchesSearch = 
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'short') return matchesSearch && route.distance < 50;
    if (activeTab === 'medium') return matchesSearch && route.distance >= 50 && route.distance < 200;
    if (activeTab === 'long') return matchesSearch && route.distance >= 200;
    
    return matchesSearch;
  });

  const routeStats = {
    total: routes.length,
    short: routes.filter(r => r.distance < 50).length,
    medium: routes.filter(r => r.distance >= 50 && r.distance < 200).length,
    long: routes.filter(r => r.distance >= 200).length,
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
    avgDistance: routes.length > 0 ? routes.reduce((sum, r) => sum + r.distance, 0) / routes.length : 0,
    totalTime: routes.reduce((sum, r) => sum + (r.baseTime || 0), 0),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let success = false;
      if (editingRoute) {
        success = await updateRoute(editingRoute._id, formData);
      } else {
        success = await createRoute(formData);
      }

      if (success) {
        handleCloseDialog();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (route: RouteType) => {
    setEditingRoute(route);
    setFormData({
      routeId: route.routeId || '',
      routeName: route.routeName,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      distance: route.distance,
      trafficLevel: route.trafficLevel || 'Low',
      baseTime: route.baseTime,
      estimatedTime: route.estimatedTime || route.baseTime,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (route: RouteType) => {
    if (window.confirm(`Are you sure you want to delete route "${route.routeName}"?`)) {
      await deleteRoute(route._id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRoute(null);
    setFormData({
      routeId: '',
      routeName: '',
      startLocation: '',
      endLocation: '',
      distance: 0,
      trafficLevel: 'Low' as const,
      baseTime: 0,
      estimatedTime: 0,
    });
  };

  const handleChange = (field: keyof CreateRouteInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const estimateTimeFromDistance = (distance: number) => {
    // Estimate time based on average speed of 60 km/h
    return Math.round(distance / 60 * 60); // in minutes
  };

  const handleDistanceChange = (distance: number) => {
    handleChange('distance', distance);
    // Auto-calculate estimated time if not manually set
    if (distance > 0) {
      const estimatedTime = estimateTimeFromDistance(distance);
      handleChange('estimatedTime', estimatedTime);
    }
  };

  const getDistanceCategory = (distance: number) => {
    if (distance < 50) return { label: 'Short', color: 'bg-green-100 text-green-800' };
    if (distance < 200) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Long', color: 'bg-red-100 text-red-800' };
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Routes</h1>
          <p className="text-muted-foreground">
            Manage delivery routes and optimize logistics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
                </DialogTitle>
                <DialogDescription>
                  {editingRoute 
                    ? 'Update the route information below.'
                    : 'Enter the details for the new route.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    value={formData.routeName}
                    onChange={(e) => handleChange('routeName', e.target.value)}
                    placeholder="e.g., Downtown Express"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startLocation">Start Location</Label>
                    <Input
                      id="startLocation"
                      value={formData.startLocation}
                      onChange={(e) => handleChange('startLocation', e.target.value)}
                      placeholder="Starting point"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endLocation">End Location</Label>
                    <Input
                      id="endLocation"
                      value={formData.endLocation}
                      onChange={(e) => handleChange('endLocation', e.target.value)}
                      placeholder="Destination"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.distance || ''}
                      onChange={(e) => handleDistanceChange(Number(e.target.value))}
                      placeholder="0.0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">
                      Estimated Time (minutes)
                      <span className="text-xs text-muted-foreground ml-1">
                        (auto-calculated)
                      </span>
                    </Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="0"
                      value={formData.estimatedTime || ''}
                      onChange={(e) => handleChange('estimatedTime', Number(e.target.value))}
                      placeholder="Auto-calculated"
                      required
                    />
                  </div>
                </div>
                
                {formData.distance > 0 && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="h-4 w-4" />
                      <span className="font-medium">Route Calculations</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>Avg Speed: 60 km/h</span>
                      <span>Fuel Est: {(formData.distance * 0.08).toFixed(1)}L</span>
                      <span>Time Est: {formatTime(estimateTimeFromDistance(formData.distance))}</span>
                      <span>Category: {getDistanceCategory(formData.distance).label}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingRoute ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingRoute ? 'Update Route' : 'Create Route'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes by name, start, or end location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{routeStats.total}</p>
              </div>
              <Route className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">{routeStats.totalDistance.toFixed(0)} km</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Distance</p>
                <p className="text-2xl font-bold">{routeStats.avgDistance.toFixed(1)} km</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(routeStats.totalTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Routes Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Routes
          </CardTitle>
          <CardDescription>
            Manage and optimize delivery routes for efficient logistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({routeStats.total})</TabsTrigger>
              <TabsTrigger value="short">Short ({routeStats.short})</TabsTrigger>
              <TabsTrigger value="medium">Medium ({routeStats.medium})</TabsTrigger>
              <TabsTrigger value="long">Long ({routeStats.long})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading routes...</span>
                </div>
              ) : filteredRoutes.length === 0 ? (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No routes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || activeTab !== 'all' 
                      ? 'No routes match your search criteria.' 
                      : 'Get started by creating your first route.'
                    }
                  </p>
                  {!searchTerm && activeTab === 'all' && (
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Route
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Start Location</TableHead>
                        <TableHead>End Location</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Est. Time</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.map((route) => {
                        const category = getDistanceCategory(route.distance);
                        return (
                          <TableRow key={route._id}>
                            <TableCell className="font-medium">{route.routeName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                {route.startLocation}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                {route.endLocation}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                {route.distance} km
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatTime(route.estimatedTime || route.baseTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={category.color}>
                                {category.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTime(route.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(route)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(route)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;
