import React, { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { useRoutes } from '../hooks/useRoutes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
  Search,
  Clock,
  UserCheck,
  UserX,
  Activity,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import type { Driver, CreateDriverInput } from '../types';

const Drivers: React.FC = () => {
  const { drivers, loading, error, createDriver, updateDriver, deleteDriver } = useDrivers();
  const { routes } = useRoutes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateDriverInput>({
    name: '',
    licenseNumber: '',
    phone: '',
    assignedRoute: 'none',
    currentShiftHours: 0,
    past7DaysHours: 0,
    dailyHoursWorked: 0,
    fatigueStatus: false,
    isAvailable: true
  });
  const [formLoading, setFormLoading] = useState(false);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.phone && driver.phone.includes(searchTerm))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const driverData = {
        ...formData,
        assignedRoute: formData.assignedRoute === 'none' ? undefined : formData.assignedRoute,
      };

      let success = false;
      if (editingDriver) {
        success = await updateDriver(editingDriver._id, driverData);
      } else {
        success = await createDriver(driverData);
      }

      if (success) {
        handleCloseDialog();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone || '',
      assignedRoute: driver.assignedRoute?._id || 'none',
      currentShiftHours: driver.currentShiftHours || 0,
      past7DaysHours: driver.past7DaysHours || 0,
      dailyHoursWorked: driver.dailyHoursWorked || 0,
      fatigueStatus: driver.fatigueStatus || false,
      isAvailable: driver.isAvailable !== undefined ? driver.isAvailable : true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (window.confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      await deleteDriver(driver._id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDriver(null);
    setFormData({
      name: '',
      licenseNumber: '',
      phone: '',
      assignedRoute: 'none',
      currentShiftHours: 0,
      past7DaysHours: 0,
      dailyHoursWorked: 0,
      fatigueStatus: false,
      isAvailable: true
    });
  };

  const handleChange = (field: keyof CreateDriverInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getDriverStatusBadge = (driver: Driver) => {
    if (!driver.isAvailable) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800"><UserX className="h-3 w-3 mr-1" />Unavailable</Badge>;
    }
    if (driver.fatigueStatus) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Fatigued</Badge>;
    }
    if (driver.assignedRoute) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><Activity className="h-3 w-3 mr-1" />On Route</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800"><UserCheck className="h-3 w-3 mr-1" />Available</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers</h1>
          <p className="text-muted-foreground">
            Manage your delivery drivers, track work hours, and monitor fatigue status
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </DialogTitle>
                <DialogDescription>
                  {editingDriver 
                    ? 'Update the driver information below.'
                    : 'Enter the details for the new driver.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter driver name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => handleChange('licenseNumber', e.target.value)}
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Work Hours & Status */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Work Hours & Status</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentShiftHours">Current Shift Hours</Label>
                      <Input
                        id="currentShiftHours"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.currentShiftHours}
                        onChange={(e) => handleChange('currentShiftHours', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dailyHoursWorked">Daily Hours Worked</Label>
                      <Input
                        id="dailyHoursWorked"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.dailyHoursWorked}
                        onChange={(e) => handleChange('dailyHoursWorked', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="past7DaysHours">Past 7 Days Hours</Label>
                    <Input
                      id="past7DaysHours"
                      type="number"
                      min="0"
                      max="168"
                      step="0.5"
                      value={formData.past7DaysHours}
                      onChange={(e) => handleChange('past7DaysHours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="isAvailable">Availability</Label>
                      <Select
                        value={formData.isAvailable ? 'true' : 'false'}
                        onValueChange={(value) => handleChange('isAvailable', value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fatigueStatus">Fatigue Status</Label>
                      <Select
                        value={formData.fatigueStatus ? 'true' : 'false'}
                        onValueChange={(value) => handleChange('fatigueStatus', value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Normal</SelectItem>
                          <SelectItem value="true">Fatigued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Route Assignment */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Route Assignment</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assignedRoute">Assigned Route (Optional)</Label>
                    <Select
                      value={formData.assignedRoute}
                      onValueChange={(value) => handleChange('assignedRoute', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a route" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No route assigned</SelectItem>
                        {routes.map((route) => (
                          <SelectItem key={route._id} value={route._id}>
                            {route.routeName} ({route.startLocation} → {route.endLocation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingDriver ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingDriver ? 'Update Driver' : 'Create Driver'
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
              placeholder="Search drivers by name, license, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Driver Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold">{drivers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.isAvailable && !d.fatigueStatus).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Routes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {drivers.filter(d => d.assignedRoute).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fatigued</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {drivers.filter(d => d.fatigueStatus).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
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

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Drivers ({filteredDrivers.length})
          </CardTitle>
          <CardDescription>
            Manage driver information, work hours, and route assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading drivers...</span>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No drivers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No drivers match your search criteria.' : 'Get started by adding your first driver.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver._id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {driver.licenseNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {driver.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>Current: {driver.currentShiftHours || 0}h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            <span>Daily: {driver.dailyHoursWorked || 0}h</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            7-day: {driver.past7DaysHours || 0}h
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.assignedRoute ? (
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{driver.assignedRoute.routeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {driver.assignedRoute.startLocation} → {driver.assignedRoute.endLocation}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No route assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getDriverStatusBadge(driver)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(driver.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(driver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(driver)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;
