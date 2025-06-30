import { Navbar } from "@/components/navbar";
import BusinessMap from "../components/BusinessMap";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About Our Full Stack Application
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Learn about the technologies and architecture behind our application
                </p>
              </div>
              
              <div className="text-left space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Technology Stack</h2>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Frontend</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Next.js 13 - React framework with server-side rendering</li>
                      <li>Tailwind CSS - Utility-first CSS framework</li>
                      <li>shadcn/ui - Reusable component library</li>
                      <li>TypeScript - Static type checking</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Backend</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Spring Boot - Java-based backend framework</li>
                      <li>Spring Security - Authentication and authorization</li>
                      <li>JWT - Secure token-based authentication</li>
                      <li>Spring Data MongoDB - Data access layer</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Database</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>MongoDB - NoSQL document database</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">DevOps</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Docker - Containerization</li>
                      <li>Docker Compose - Multi-container orchestration</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Architecture</h2>
                  <p>
                    This application follows a microservices architecture with separate frontend and backend services.
                    The frontend is a Next.js application that communicates with the backend through RESTful API endpoints.
                    The backend is built with Spring Boot and handles business logic, authentication, and data access.
                    MongoDB is used as the database to store user information and application data.
                  </p>
                  <p>
                    The entire application is containerized using Docker, which makes it easy to develop, deploy,
                    and scale. Docker Compose is used to orchestrate the multiple containers and their interactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-4">Địa chỉ doanh nghiệp</h2>
            <p className="mb-4">123 Đường ABC, Quận XYZ, Hà Nội</p>
            <BusinessMap />
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FullStack App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}