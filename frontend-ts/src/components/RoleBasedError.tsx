import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Shield, User, Info } from 'lucide-react';

interface RoleBasedErrorProps {
  error: string;
  currentUserRole?: string;
}

export const RoleBasedError: React.FC<RoleBasedErrorProps> = ({ error, currentUserRole }) => {
  const isPermissionError = error.includes('Access denied') || error.includes('403') || error.includes('Forbidden') || error.includes('Admin privileges required');

  if (!isPermissionError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Permission Requirements:</p>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-green-600" />
                <span><strong>Admin:</strong> Can initialize data, manage all records, run simulations, view all reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 text-blue-600" />
                <span><strong>Driver:</strong> Can view deliveries, update delivery status, view assigned routes</span>
              </div>
            </div>
            {currentUserRole && (
              <p className="text-sm font-medium mt-2">
                Your current role: <span className="capitalize">{currentUserRole}</span>
                {currentUserRole === 'driver' && (
                  <span className="text-muted-foreground"> (Limited access)</span>
                )}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RoleBasedError;
