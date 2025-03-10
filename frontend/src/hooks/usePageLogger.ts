import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

export const usePageLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const timestamp = new Date().toISOString();
    logger.info('Page Visit', {
      path: location.pathname,
      search: location.search,
      timestamp
    });
  }, [location]);
}; 