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

const registerFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  full_name: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

interface RegisterFormProps {
  onRegisterSuccess: () => void
  switchToLogin: () => void
}

export function RegisterForm({ onRegisterSuccess, switchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    setError(null)
    console.log('Starting registration process...')
    console.log('Registration values:', { ...values, password: '[REDACTED]' })

    try {
      console.log('Preparing registration request...')
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values),
      })

      console.log('Registration response received:', {
        status: response.status,
        statusText: response.statusText,
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : null
        console.log('Parsed response data:', responseData)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        console.error('Raw response that failed to parse:', responseText)
      }

      if (!response.ok) {
        const errorMessage = responseData?.detail || `Registration failed: ${response.statusText}`
        console.error('Registration failed:', {
          status: response.status,
          error: errorMessage,
          response: responseData,
        })
        throw new Error(errorMessage)
      }

      console.log('Registration successful!')
      toast.success('Registration successful! Please log in.')
      onRegisterSuccess()

    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      })
      setError(err.message || 'An unexpected error occurred.')
      toast.error(err.message || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={switchToLogin}>
            Login here
          </Button>
        </p>
      </CardContent>
    </Card>
  )
} 