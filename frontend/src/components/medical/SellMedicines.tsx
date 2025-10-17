import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  FileText,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  blood_group?: string;
  date_of_birth?: string;
  medical_history?: string;
};

type CustomerOrPatient = Customer | (Patient & { isPatient: true });

type Medicine = {
  id: string;
  name: string;
  generic_name?: string;
  strength?: string;
  form?: string;
  manufacturer?: string;
  stock_quantity: number;
  price_per_unit: number;
  expiry_date?: string;
};

type CartItem = {
  medicine: Medicine;
  quantity: number;
  total: number;
};

export default function SellMedicines() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOrPatient | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerOrPatient[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchPatients();
    fetchMedicines();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } else {
      setCustomers(data || []);
    }
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("first_name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } else {
      setPatients(data || []);
    }
  };

  // Helper function to get display name for customer or patient
  const getDisplayName = (item: CustomerOrPatient): string => {
    if ("isPatient" in item) {
      return `${item.first_name || ""} ${item.last_name || ""}`.trim();
    }
    return item.name;
  };

  // Helper function to get email for customer or patient
  const getEmail = (item: CustomerOrPatient): string => {
    return item.email || "";
  };

  // Helper function to get phone for customer or patient
  const getPhone = (item: CustomerOrPatient): string => {
    return item.phone || "";
  };

  const fetchMedicines = async () => {
    const { data, error } = await supabase
      .from("medicine_inventory")
      .select("*")
      .eq("active", true)
      .gt("stock_quantity", 0)
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medicines",
        variant: "destructive",
      });
    } else {
      setMedicines(data || []);
    }
  };

  // Unified search function for both customers and patients
  const handleCustomerSearch = (searchValue: string) => {
    setCustomerSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerSearch = searchValue.toLowerCase().trim();

    // Search customers
    const matchedCustomers = customers.filter(
      (customer) =>
        customer.phone?.toLowerCase().includes(lowerSearch) ||
        customer.email?.toLowerCase().includes(lowerSearch)
    );

    // Search patients
    const matchedPatients: (Patient & { isPatient: true })[] = patients
      .filter(
        (patient) =>
          patient.phone?.toLowerCase().includes(lowerSearch) ||
          patient.email?.toLowerCase().includes(lowerSearch)
      )
      .map((patient) => ({ ...patient, isPatient: true as const }));

    const combined = [...matchedCustomers, ...matchedPatients];
    setSearchResults(combined);
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (result: CustomerOrPatient) => {
    setSelectedCustomer(result);
    setCustomerSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Name, email, and phone are required",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([newCustomer])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    } else {
      setSelectedCustomer(data);
      setCustomers([...customers, data]);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      setIsNewCustomer(false);
      setIsCustomerDialogOpen(false);
      toast({ title: "Success", description: "Customer created successfully" });
    }
  };

  const handleAddToCart = () => {
    if (!selectedMedicine || quantity <= 0) return;

    if (quantity > selectedMedicine.stock_quantity) {
      toast({
        title: "Error",
        description: "Insufficient stock",
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.medicine.id === selectedMedicine.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].total =
        updatedCart[existingItemIndex].quantity *
        selectedMedicine.price_per_unit;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          medicine: selectedMedicine,
          quantity,
          total: quantity * selectedMedicine.price_per_unit,
        },
      ]);
    }

    setSelectedMedicine(null);
    setQuantity(1);
    setSearchTerm("");
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicine.id !== medicineId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateGST = () => {
    return gstEnabled ? calculateSubtotal() * 0.18 : 0;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    switch (appliedCoupon) {
      case "FLAT20":
        return subtotal * 0.2;
      case "FLAT30":
        return subtotal * 0.3;
      case "FLAT10":
        return subtotal * 0.1;
      case "FLAT05":
        return subtotal * 0.05;
      default:
        return 0;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() - calculateDiscount();
  };

  const handleApplyCoupon = () => {
    const validCoupons = ["FLAT20", "FLAT30", "FLAT10", "FLAT05"];
    const upperCoupon = couponCode.toUpperCase().trim();

    if (validCoupons.includes(upperCoupon)) {
      setAppliedCoupon(upperCoupon);
      toast({
        title: "Success",
        description: `Coupon ${upperCoupon} applied successfully!`,
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid coupon code",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  //   const generatePDF = (saleData: any) => {
  //     try {
  //       console.log("Starting PDF generation with data:", saleData);
  //       const doc = new jsPDF();

  //       // Header
  //       doc.setFontSize(20);
  //       doc.text("Medicine Sale Receipt", 105, 20, { align: "center" });

  //       // Customer Info
  //       doc.setFontSize(12);
  //       doc.text("Customer Details:", 20, 40);
  //       doc.text(
  //         `Name: ${selectedCustomer ? getDisplayName(selectedCustomer) : ""}`,
  //         20,
  //         50
  //       );
  //       doc.text(
  //         `Email: ${selectedCustomer ? getEmail(selectedCustomer) : ""}`,
  //         20,
  //         60
  //       );
  //       doc.text(
  //         `Phone: ${selectedCustomer ? getPhone(selectedCustomer) : ""}`,
  //         20,
  //         70
  //       );

  //       // Sale Info
  //       doc.text(`Sale Date: ${new Date().toLocaleDateString()}`, 120, 50);
  //       doc.text(`Receipt No: ${saleData.id.slice(-8)}`, 120, 60);

  //       // Table
  //       const tableData = cart.map((item) => [
  //         item.medicine.name,
  //         item.quantity.toString(),
  //         `₹${item.medicine.price_per_unit.toFixed(2)}`,
  //         `₹${item.total.toFixed(2)}`,
  //       ]);

  //       (doc as any).autoTable({
  //         head: [["Medicine", "Qty", "Unit Price", "Total"]],
  //         body: tableData,
  //         startY: 85,
  //         theme: "grid",
  //       });

  //       // Totals
  //       const finalY = (doc as any).lastAutoTable.finalY + 10;
  //       let currentY = finalY;

  //       doc.text(`Subtotal: ₹${calculateSubtotal().toFixed(2)}`, 120, currentY);
  //       currentY += 10;

  //       if (gstEnabled) {
  //         doc.text(`GST (18%): ₹${calculateGST().toFixed(2)}`, 120, currentY);
  //         currentY += 10;
  //       }

  //       if (appliedCoupon) {
  //         doc.text(
  //           `Discount (${appliedCoupon}): -₹${calculateDiscount().toFixed(2)}`,
  //           120,
  //           currentY
  //         );
  //         currentY += 10;
  //       }

  //       doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 120, currentY);

  //       // Save
  //       console.log("About to save PDF");
  //       doc.save(`receipt-${saleData.id.slice(-8)}.pdf`);
  //       console.log("PDF saved successfully");
  //     } catch (error) {
  //       console.error("PDF generation error:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to generate PDF",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   const downloadTemplatePDF = async (saleId: string) => {
  //     if (!selectedCustomer) return;

  //     try {
  //       const { generateBillingPDF } = await import("@/lib/templatePdfGenerator");

  //       const pdfData = {
  //         billing_id: saleId.slice(-8),
  //         sale_date: new Date().toLocaleDateString(),
  //         sale_time: new Date().toLocaleTimeString(),
  //         customer_name: getDisplayName(selectedCustomer),
  //         customer_phone: getPhone(selectedCustomer),
  //         customer_email: getEmail(selectedCustomer),
  //         items: cart.map((item) => ({
  //           name: item.medicine.name,
  //           quantity: item.quantity,
  //           unit_price: item.medicine.price_per_unit,
  //           total: item.total,
  //         })),
  //         subtotal: calculateSubtotal(),
  //         discount_amount: calculateDiscount(),
  //         gst_amount: calculateGST(),
  //         total_amount: calculateTotal(),
  //         payment_status: "Completed",
  //         coupon_code: appliedCoupon || undefined,
  //       };

  //       const blob = await generateBillingPDF(pdfData);
  //       const url = URL.createObjectURL(blob);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = `invoice_${saleId.slice(-8)}_${
  //         new Date().toISOString().split("T")[0]
  //       }.pdf`;
  //       a.click();
  //       URL.revokeObjectURL(url);

  //       toast({
  //         title: "Success",
  //         description: "Invoice PDF downloaded successfully",
  //       });
  //     } catch (error) {
  //       console.error("Error generating template PDF:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to generate PDF from template",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  const handleSubmitSale = async () => {
    console.log("Starting sale submission");
    console.log("Selected customer:", selectedCustomer);
    console.log("Cart:", cart);

    if (!selectedCustomer || cart.length === 0) {
      toast({
        title: "Error",
        description: "Please select customer and add medicines",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let customerId = selectedCustomer.id;

      // If a patient is selected, create a temporary customer record
      if ("isPatient" in selectedCustomer) {
        const patientData = selectedCustomer;
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert([
            {
              name: `${patientData.first_name || ""} ${
                patientData.last_name || ""
              }`.trim(),
              email: patientData.email || "",
              phone: patientData.phone || "",
              address: patientData.address || "",
            },
          ])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create sale record
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            customer_id: customerId,
            subtotal: calculateSubtotal(),
            gst_enabled: gstEnabled,
            gst_amount: calculateGST(),
            coupon_code: appliedCoupon,
            discount_amount: calculateDiscount(),
            total_amount: calculateTotal(),
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: saleData.id,
        medicine_id: item.medicine.id,
        quantity: item.quantity,
        unit_price: item.medicine.price_per_unit,
        total_price: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory
      for (const item of cart) {
        const { error: inventoryError } = await supabase
          .from("medicine_inventory")
          .update({
            stock_quantity: item.medicine.stock_quantity - item.quantity,
          })
          .eq("id", item.medicine.id);

        if (inventoryError) throw inventoryError;
      }

      // Generate PDF using template
      console.log("Sale data before PDF generation:", saleData);
      //   await downloadTemplatePDF(saleData.id);

      // Reset form
      setCart([]);
      setSelectedCustomer(null);
      setGstEnabled(false);
      setCouponCode("");
      setAppliedCoupon(null);

      // Refresh medicines to show updated stock
      fetchMedicines();

      toast({ title: "Success", description: "Sale completed successfully!" });
    } catch (error) {
      console.error("Sale error:", error);
      toast({
        title: "Error",
        description: `Failed to process sale: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.generic_name &&
        medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Customer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Select existing customer or create new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">
                  {getDisplayName(selectedCustomer)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getEmail(selectedCustomer)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getPhone(selectedCustomer)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                Change Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unified Search Bar */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone number or email..."
                    value={customerSearchTerm}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-background border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.map((result) => {
                      const isPatient = "isPatient" in result;
                      return (
                        <div
                          key={result.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectSearchResult(result)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {getDisplayName(result)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getEmail(result)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getPhone(result)}
                              </p>
                            </div>
                            <Badge
                              variant={isPatient ? "outline" : "secondary"}
                            >
                              {isPatient ? "Patient" : "Customer"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No Results Message */}
                {showSearchResults &&
                  searchResults.length === 0 &&
                  customerSearchTerm.trim() && (
                    <div className="absolute z-10 w-full mt-2 bg-background border rounded-lg shadow-lg p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        No matching customer or patient found
                      </p>
                    </div>
                  )}
              </div>

              {/* New Customer Button */}
              <Dialog open={isNewCustomer} onOpenChange={setIsNewCustomer}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add customer details for the sale
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newCustomer.name}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newCustomer.address}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleCreateCustomer}>
                      Create Customer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Medicine Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Medicine Selection
            </CardTitle>
            <CardDescription>Search and add medicines to cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMedicine?.id === medicine.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{medicine.name}</p>
                        {medicine.generic_name && (
                          <p className="text-sm text-muted-foreground">
                            {medicine.generic_name}
                          </p>
                        )}
                        <p className="text-sm">
                          {medicine.strength} • {medicine.form} •{" "}
                          {medicine.manufacturer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{medicine.price_per_unit.toFixed(2)}
                        </p>
                        <Badge variant="secondary">
                          {medicine.stock_quantity} in stock
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedMedicine && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max={selectedMedicine.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Button onClick={handleAddToCart} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Bill Preview
            </CardTitle>
            <CardDescription>Review items and calculate total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items in cart
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.medicine.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ₹
                          {item.medicine.price_per_unit.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₹{item.total.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromCart(item.medicine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gst"
                        checked={gstEnabled}
                        onCheckedChange={(checked) =>
                          setGstEnabled(checked === true)
                        }
                      />
                      <Label htmlFor="gst">Enable GST (18%)</Label>
                    </div>
                    {gstEnabled && <span>₹{calculateGST().toFixed(2)}</span>}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{appliedCoupon}</Badge>
                          <span className="text-sm">Discount Applied</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            -₹{calculateDiscount().toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRemoveCoupon}
                            className="h-6 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          variant="outline"
                          disabled={!couponCode.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Valid codes: FLAT05 (5%), FLAT10 (10%), FLAT20 (20%),
                      FLAT30 (30%)
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitSale}
                  disabled={!selectedCustomer || cart.length === 0 || isLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : "Complete Sale & Generate PDF"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
