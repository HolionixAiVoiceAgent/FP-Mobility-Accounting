import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { useEffect } from 'react';

const Index = () => {
  // Debug: Log when Index component mounts
  useEffect(() => {
    console.log('[Index] Component mounted');
  }, []);

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
