import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Debug log to check if the key is being loaded
console.log('Clerk Key:', clerkPubKey);

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
} 