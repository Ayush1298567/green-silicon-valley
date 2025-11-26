"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VolunteerSignupPageContent from './VolunteerSignupPageContent';

export default function VolunteerSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VolunteerSignupPageContent />
    </Suspense>
  );
}