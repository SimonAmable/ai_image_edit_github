'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const ManageSubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="dark:bg-black dark:text-white dark:border-white/20 bg-white text-black border border-black/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      onClick={handleManageSubscription}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
};

export default ManageSubscriptionButton;