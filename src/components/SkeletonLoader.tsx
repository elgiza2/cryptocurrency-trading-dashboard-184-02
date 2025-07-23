import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'giveaway' | 'mining' | 'list';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3, type = 'giveaway' }) => {
  if (type === 'giveaway') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <CardHeader className="pb-1 pt-3">
              <div className="flex items-start justify-between">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-5 bg-muted rounded w-16"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div className="aspect-square w-16 mx-auto bg-muted rounded"></div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-10"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-18"></div>
                  <div className="h-3 bg-muted rounded w-14"></div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1"></div>
              <div className="h-7 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'mining') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className="h-6 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-muted rounded w-24 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-12 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;