import { useState, useEffect } from "react"; // ⬅️ added useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import Select from "react-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Building2 } from "lucide-react";
import { createEmployee } from "@/api/services/employeService";
import { getRoles } from "@/api/services/employeService"; // ⬅️ NEW service import
// Add these from first code:
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button"; // already imported

// ✅ Zod schema
const employeeSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  primary_role: z.string().min(1, "Primary role is required"), // ⬅️ new field
  secondary_roles: z.array(z.string()).optional(),
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
  const [primaryRole, setPrimaryRole] = useState<RoleOption | null>(null);
  // Instead, for primary role you can keep a similar pattern as field.value if you want badge-style UI:
  const [primaryRoleSelected, setPrimaryRoleSelected] =
    useState<RoleOption | null>(null);

  // ✅ Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles(); // your service call
        const options: RoleOption[] = response.data.map((role: any) => ({
          value: role._id, // use role_id as the value
          label: role.name, // use name as the label
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
      primary_role: "", // new
      secondary_roles: [], // new
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
      // Map primary and secondary roles to nested structure with Mongo _id
      const primaryRole = roles.find((r) => r.value === data.primary_role);
      const secondaryRoles = (data.secondary_roles || [])
        .filter((r) => r !== data.primary_role) // prevent duplicate of primary
        .map((roleId) => roles.find((r) => r.value === roleId))
        .filter(Boolean); // remove any nulls

      // Transform payload to nested structure
      const payload = {
        ...data,
        salary: data.salary ? Number(data.salary) : undefined,
        employee_type: {
          primary_role_type: primaryRole
            ? { role: primaryRole.value, role_name: primaryRole.label }
            : null,
          secondary_role_type: secondaryRoles.map((r) => ({
            role: r!.value,
            role_name: r!.label,
          })),
        },
      };

      const response = await createEmployee(payload);
      console.log("Sucess Message ", response);
      toast.success(`Employee ${response.employee_id} onboarded successfully!`);
      form.reset();
      setPrimaryRole(null); // Reset primary role select
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
          <h1 className="text-2xl font-bold text-foreground">
            Employee Onboarding
          </h1>
          <p className="text-muted-foreground">
            Add new employees to the hospital system
          </p>
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
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

              {/* Primary Roles  */}

              <FormField
                control={form.control}
                name="primary_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Primary Role Type *</FormLabel>
                    <div className="space-y-2">
                      {field.value && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {roles.find((r) => r.value === field.value)?.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => field.onChange("")}
                          />
                        </Badge>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-normal"
                          >
                            {field.value
                              ? "Change primary role..."
                              : "Select primary role"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search roles..." />
                            <CommandList>
                              <CommandEmpty>No role found.</CommandEmpty>
                              <CommandGroup>
                                {roles.map((role) => (
                                  <CommandItem
                                    key={role.value}
                                    value={role.value}
                                    onSelect={() => field.onChange(role.value)}
                                  >
                                    {role.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Secondry Roles (Multi-select) */}

              <FormField
                control={form.control}
                name="secondary_roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Secondary Role Type</FormLabel>
                    <div className="space-y-2">
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((roleId) => (
                            <Badge
                              key={roleId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {roles.find((r) => r.value === roleId)?.label}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newValue =
                                    field.value?.filter((v) => v !== roleId) ||
                                    [];
                                  field.onChange(newValue);
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-normal"
                          >
                            {field.value?.length > 0
                              ? "Add more roles..."
                              : "Select secondary roles"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search roles..." />
                            <CommandList>
                              <CommandEmpty>No role found.</CommandEmpty>
                              <CommandGroup>
                                {roles
                                  .filter(
                                    (r) => !field.value?.includes(r.value)
                                  ) // exclude already selected
                                  .map((role) => (
                                    <CommandItem
                                      key={role.value}
                                      value={role.value}
                                      onSelect={() =>
                                        field.onChange([
                                          ...(field.value || []),
                                          role.value,
                                        ])
                                      }
                                    >
                                      {role.label}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
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
                      <Input
                        type="number"
                        placeholder="Enter salary"
                        {...field}
                      />
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
                      <Input
                        placeholder="Enter emergency contact name"
                        {...field}
                      />
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
                      <Input
                        placeholder="Enter emergency contact phone"
                        {...field}
                      />
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
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
