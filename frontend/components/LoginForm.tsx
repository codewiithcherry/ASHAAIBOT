'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

interface LoginFormProps {
  onLoginSuccess: (token: string) => void // Callback with the auth token
  switchToRegister: () => void // Callback to switch view to Register form
}

export function LoginForm({ onLoginSuccess, switchToRegister }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    console.log('Starting login process...')

    // The backend expects form data for the token endpoint
    const formData = new URLSearchParams()
    formData.append('username', values.email) // FastAPI's OAuth2PasswordRequestForm expects 'username'
    formData.append('password', values.password)

    try {
        console.log('Preparing login request...')
        const response = await fetch('http://localhost:8000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        })

        console.log('Login response received:', {
            status: response.status,
            statusText: response.statusText,
        })

        const responseText = await response.text()
        console.log('Raw response:', responseText)

        let responseData
        try {
            responseData = responseText ? JSON.parse(responseText) : null
        } catch (e) {
            console.error('Failed to parse response as JSON:', e)
        }

        if (!response.ok) {
            const errorMessage = responseData?.detail || `Login failed: ${response.statusText}`
            console.error('Login failed:', {
                status: response.status,
                error: errorMessage,
                response: responseData,
            })
            throw new Error(errorMessage)
        }

        console.log('Login successful!')
        toast.success('Login successful!')
        onLoginSuccess(responseData.access_token)

    } catch (err: any) {
        console.error('Login error:', err)
        setError(err.message || 'An unexpected error occurred during login.')
        toast.error(err.message || 'Login failed.')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your ASHA AI account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={switchToRegister}>
            Register here
          </Button>
        </p>
      </CardContent>
    </Card>
  )
} 