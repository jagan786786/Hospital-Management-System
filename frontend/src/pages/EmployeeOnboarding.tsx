import { useState, useEffect } from "react"; // ⬅️ added useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Building2 } from "lucide-react";
import { createEmployee } from "@/api/services/employeService";
import { getRoles } from "@/api/services/employeService"; // ⬅️ NEW service import


// ✅ Zod schema
const employeeSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  employee_type: z.array(z.string()).optional(), // ⬅️ array for multiple roles
  department: z.string().optional(),
  salary: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  date_of_joining: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  type RoleOption = { value: string; label: string };
  const [roles, setRoles] = useState<RoleOption[]>([]);
      

  // ✅ Fetch roles from API
    useEffect(() => {
  const fetchRoles = async () => {
    try {
      const response = await getRoles(); // your service call
      const options: RoleOption[] = response.data.map((role: any) => ({
        value: role.role_id, // use role_id as the value
        label: role.name     // use name as the label
      }));
      setRoles(options);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  };
  
  fetchRoles();
}, []);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_type: [], // ⬅️ start with empty array, not string
      department: "",
      salary: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      date_of_joining: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        salary: data.salary ? Number(data.salary) : undefined,
        
      };

      const response = await createEmployee(payload);
      toast.success(`Employee ${response.employee_id} onboarded successfully!`);
      form.reset();
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Onboarding</h1>
          <p className="text-muted-foreground">Add new employees to the hospital system</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Employee Information</CardTitle>
          </div>
          <CardDescription>
            Fill in the employee details. Email and phone number must be unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* First Name */}
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roles (Multi-select) */}
              {/* Roles (Multi-select) */}
                  <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Type</FormLabel>
                      <FormControl>
                           <Select
                            options={roles}              // ✅ transformed roles
                            isMulti                       // allow multiple selection
                            value={roles.filter(r => field.value?.includes(r.value))} 
                            onChange={(selected: any) =>
                              field.onChange(selected.map((s: any) => s.value))
                            }
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Joining */}
              <FormField
                control={form.control}
                name="date_of_joining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Joining</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter salary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Contact Name */}
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emergency contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Contact Phone */}
              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emergency contact phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating Employee..." : "Create Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
