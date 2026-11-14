'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ServiceForm } from '@/components/admin/service-form';
import { fetchApi } from '@/lib/api-client';

export default function EditServicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi(`/admin/services/${id}`);
        setService(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!service) {
    return <div className="text-white text-center py-20">Service not found.</div>;
  }

  return <ServiceForm initialData={service} isEdit={true} />;
}
