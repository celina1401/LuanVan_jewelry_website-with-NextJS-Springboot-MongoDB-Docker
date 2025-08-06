'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toast]:bg-green-50 group-[.toast]:border-green-200 group-[.toast]:text-green-900 dark:group-[.toast]:bg-green-900/20 dark:group-[.toast]:border-green-700 dark:group-[.toast]:text-green-200 [&>div]:text-green-700 dark:[&>div]:text-green-300',
          error: 'group-[.toast]:bg-red-50 group-[.toast]:border-red-200 group-[.toast]:text-red-900 dark:group-[.toast]:bg-red-900/20 dark:group-[.toast]:border-red-700 dark:group-[.toast]:text-red-200',
          warning: 'group-[.toast]:bg-yellow-50 group-[.toast]:border-yellow-200 group-[.toast]:text-yellow-900 dark:group-[.toast]:bg-yellow-900/20 dark:group-[.toast]:border-yellow-700 dark:group-[.toast]:text-yellow-200',
          info: 'group-[.toast]:bg-blue-50 group-[.toast]:border-blue-200 group-[.toast]:text-blue-900 dark:group-[.toast]:bg-blue-900/20 dark:group-[.toast]:border-blue-700 dark:group-[.toast]:text-blue-200',
          title: 'group-[.toast]:text-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
