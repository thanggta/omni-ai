import { DemoComponent } from "@/src/components/demo/demo-component";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Jotai + shadcn/ui + Sonner Integration
          </h1>
          <p className="text-muted-foreground">
            A complete setup with state management, UI components, and notifications
          </p>
        </div>
        <DemoComponent />
      </div>
    </div>
  );
}
