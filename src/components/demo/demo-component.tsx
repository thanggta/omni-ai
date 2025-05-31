'use client'

import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { countAtom, nameAtom, greetingAtom } from '@/src/store/atoms'

export function DemoComponent() {
  const [count, setCount] = useAtom(countAtom)
  const [name, setName] = useAtom(nameAtom)
  const [greeting] = useAtom(greetingAtom)

  const handleIncrement = () => {
    setCount(count + 1)
    toast.success(`Count increased to ${count + 1}!`)
  }

  const handleDecrement = () => {
    setCount(count - 1)
    toast.info(`Count decreased to ${count - 1}!`)
  }

  const handleReset = () => {
    setCount(0)
    setName('World')
    toast('Reset to default values', {
      description: 'Count and name have been reset',
    })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const showToastDemo = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Loading...',
        success: 'Success! All libraries are working perfectly!',
        error: 'Something went wrong',
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Jotai + shadcn/ui + Sonner Demo</CardTitle>
          <CardDescription>
            This demo showcases the integration of Jotai for state management, 
            shadcn/ui for components, and Sonner for toast notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jotai State Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Jotai State Management</h3>
            <div className="flex items-center space-x-4">
              <Button onClick={handleDecrement} variant="outline">
                -
              </Button>
              <span className="text-2xl font-bold min-w-[3rem] text-center">
                {count}
              </span>
              <Button onClick={handleIncrement}>
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Current count: {count} (managed by Jotai)
            </p>
          </div>

          {/* Name Input Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dynamic Greeting</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
              />
            </div>
            <p className="text-lg font-medium text-primary">
              {greeting}
            </p>
            <p className="text-sm text-muted-foreground">
              This greeting is computed from a derived Jotai atom
            </p>
          </div>

          {/* Toast Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sonner Toast Notifications</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => toast.success('Success toast!')}
                variant="default"
              >
                Success Toast
              </Button>
              <Button 
                onClick={() => toast.error('Error toast!')}
                variant="destructive"
              >
                Error Toast
              </Button>
              <Button 
                onClick={() => toast.warning('Warning toast!')}
                variant="outline"
              >
                Warning Toast
              </Button>
              <Button 
                onClick={showToastDemo}
                variant="secondary"
              >
                Promise Toast
              </Button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleReset} variant="outline" className="w-full">
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
