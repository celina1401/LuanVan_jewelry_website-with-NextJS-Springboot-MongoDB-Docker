/**
 * Utility functions for resolving service URLs with intelligent fallback logic
 */

export interface ServiceConfig {
  serviceName: string;
  port: string;
  localhostPort?: string;
}

export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  product: {
    serviceName: 'productservice',
    port: '9004',
    localhostPort: '9004'
  },
  user: {
    serviceName: 'userservice',
    port: '9001',
    localhostPort: '9001'
  },
  order: {
    serviceName: 'orderservice',
    port: '9003',
    localhostPort: '9003'
  },
  cart: {
    serviceName: 'cartservice',
    port: '9005',
    localhostPort: '9005'
  },
  notification: {
    serviceName: 'notificationservice',
    port: '9002',
    localhostPort: '9002'
  },
  payment: {
    serviceName: 'paymentservice',
    port: '9006',
    localhostPort: '9006'
  },
  chat: {
    serviceName: 'chatservice',
    port: '9007',
    localhostPort: '9007'
  },
  review: {
    serviceName: 'reviewservice',
    port: '9008',
    localhostPort: '9008'
  }
};

/**
 * Get prioritized URLs for a service, with Docker service names first
 */
export function getServiceUrls(serviceKey: string, envUrl?: string): string[] {
  const config = SERVICE_CONFIGS[serviceKey];
  if (!config) {
    throw new Error(`Unknown service: ${serviceKey}`);
  }

  const urls: string[] = [];
  
  // 1. Docker service name (highest priority - works when both frontend and backend are in Docker)
  urls.push(`http://${config.serviceName}:${config.port}`);
  
  // 2. Docker host (works when frontend is outside Docker but backend is in Docker)
  urls.push(`http://host.docker.internal:${config.port}`);
  
  // 3. Environment variable URL (if provided)
  if (envUrl) {
    urls.push(envUrl);
  }
  
  // 4. Localhost fallback (lowest priority - works when both are running locally)
  if (config.localhostPort) {
    urls.push(`http://localhost:${config.localhostPort}`);
  }
  
  return urls;
}

/**
 * Make a request to a service with automatic fallback
 */
export async function makeServiceRequest(
  serviceKey: string, 
  path: string, 
  options: RequestInit = {},
  envUrl?: string
): Promise<Response> {
  const urls = getServiceUrls(serviceKey, envUrl);
  
  for (const baseUrl of urls) {
    try {
      const url = `${baseUrl}${path}`;
      console.log(`Trying to fetch from: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (response.ok) {
        console.log(`Successfully fetched from: ${url}`);
        return response;
      }
    } catch (error) {
      console.log(`Failed to fetch from ${baseUrl}:`, error);
      continue;
    }
  }
  
  throw new Error(`All ${serviceKey} service URLs failed`);
}

/**
 * Get the best URL for a service (first successful one)
 */
export function getBestServiceUrl(serviceKey: string, envUrl?: string): string {
  const urls = getServiceUrls(serviceKey, envUrl);
  return urls[0]; // Return the highest priority URL
}
