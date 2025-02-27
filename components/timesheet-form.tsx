"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, UserIcon, LogOutIcon } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  date: z.date({ required_error: "A date is required" }),
  hoursWorked: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 24, {
    message: "Hours must be between 0 and 24",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

export function TimesheetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState({ name: "" })
  const router = useRouter()

  // useEffect(() => {
  //   // Fetch user data (replace with actual token logic)
  //   const token = localStorage.getItem("token")
  //   if (token) {
  //     const decodedToken = JSON.parse(atob(token.split(".")[1]))
  //     setUser({ name: decodedToken.name })
  //   } else {
  //     router.push("/login")
  //   }
  // }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      hoursWorked: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to submit timesheet")
      }

      toast({ title: "Success", description: "Timesheet entry has been saved" })
      form.reset()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save timesheet entry" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center p-6" style={{ backgroundImage: 'url("/time-management-bg.jpg")' }}>
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>TS</AvatarFallback>
            </Avatar>

          </Avatar>
          <span className="text-white font-semibold text-lg">{user.name}</span>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date.toDateString() !== new Date().toDateString()} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hoursWorked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours Worked</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="24" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your work activities..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Timesheet"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
