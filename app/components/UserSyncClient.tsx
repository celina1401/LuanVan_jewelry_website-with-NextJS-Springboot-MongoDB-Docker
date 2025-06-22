'use client';
import { useUserSync } from '@/hooks/use-user-sync';
export default function UserSyncClient() {
  useUserSync();
  return null;
} 