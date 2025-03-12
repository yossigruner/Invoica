import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreditCard, Store, AlertCircle, Trash2 } from "lucide-react";
import { cloverApi } from '@/services/clover/cloverApi';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CloverIntegration: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const location = useLocation();

  const { data: cloverStatus, refetch } = useQuery({
    queryKey: ['cloverStatus'],
    queryFn: cloverApi.getStatus,
  });

  // Check for success message in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setSuccess('Successfully connected to Clover!');
      refetch(); // Refetch the status to update the UI
    }
  }, [location, refetch]);

  const connectMutation = useMutation({
    mutationFn: cloverApi.connect,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      setError('Failed to initiate Clover connection');
      toast.error('Failed to connect to Clover');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: cloverApi.disconnect,
    onSuccess: () => {
      toast.success('Successfully disconnected from Clover');
      refetch();
      setIsDisconnectDialogOpen(false);
    },
    onError: (error) => {
      setError('Failed to disconnect from Clover');
      toast.error('Failed to disconnect from Clover');
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="space-y-6 rounded-lg bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Payment Integration</h2>
        </div>
        {cloverStatus?.connected ? (
          <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-11 transition-all border-gray-200 hover:border-destructive-300 hover:text-destructive-600 focus:border-destructive-500 focus:ring-destructive-500/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disconnect from Clover</DialogTitle>
                <DialogDescription>
                  Are you sure you want to disconnect your Clover account? This will remove your integration and you won't be able to accept credit card payments until you reconnect.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDisconnectDialogOpen(false)}
                  disabled={disconnectMutation.isPending}
                  className="h-11"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="h-11"
                >
                  {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={connectMutation.isPending}
            className="h-11 transition-all border-gray-200 hover:border-primary-300 hover:text-primary-600 focus:border-primary-500 focus:ring-primary-500/20"
          >
            <Store className="h-4 w-4 mr-2" />
            {connectMutation.isPending ? 'Connecting...' : 'Connect to Clover'}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {cloverStatus?.connected ? (
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p className="text-primary-900 font-medium">Connected to Clover</p>
              <p className="text-primary-700 mt-1">
                Your account is connected to Clover. You can now accept credit card payments for your invoices.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">Not Connected</p>
              <p className="text-gray-700 mt-1">
                Connect your Clover account to enable credit card payments for your invoices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloverIntegration; 