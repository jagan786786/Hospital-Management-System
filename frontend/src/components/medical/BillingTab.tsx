import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Filter,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SellMedicines from "./SellMedicines";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useSortable } from "@/hooks/useSortable";
import { Button } from "@/components/ui/button";
// import { generateBillingPDF } from "@/lib/templatePdfGenerator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Sale = {
  id: string;
  sale_date: string;
  customer_id: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  coupon_code?: string;
  discount_amount?: number;
  customers?: {
    name: string;
    email: string;
    phone: string;
  };
  sale_items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    medicine_inventory?: {
      name: string;
      strength?: string;
    };
  }>;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export default function BillingTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [patients, setPatients] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    billingId: "",
    customerName: "",
    email: "",
    phone: "",
    dateFrom: "",
    dateTo: "",
    gstMin: "",
    gstMax: "",
    discountMin: "",
    discountMax: "",
    totalMin: "",
    totalMax: "",
    customerType: "all", // all, patient, customer
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      fetchSales();
    }

    // Subscribe to realtime changes
    const channel = supabase
      .channel("sales-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => fetchSales()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, email, phone");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          *,
          customers (
            name,
            email,
            phone
          ),
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            medicine_inventory (
              name,
              strength
            )
          )
        `
        )
        .order("sale_date", { ascending: false });

      if (error) throw error;

      // Match customers with patients
      const salesWithPatients = (data || []).map((sale) => {
        const matchedPatient = patients.find(
          (patient) =>
            patient.email === sale.customers?.email ||
            patient.phone === sale.customers?.phone
        );

        return {
          ...sale,
          patient: matchedPatient,
        };
      });

      setSales(salesWithPatients);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch billing history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBillingId = (id: string) => {
    return `BILL-${id.slice(0, 8).toUpperCase()}`;
  };

  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.id.toLowerCase().includes(lowerSearch) ||
          sale.customer_id.toLowerCase().includes(lowerSearch) ||
          sale.customers?.name.toLowerCase().includes(lowerSearch) ||
          sale.customers?.email?.toLowerCase().includes(lowerSearch) ||
          sale.customers?.phone?.toLowerCase().includes(lowerSearch) ||
          formatDate(sale.sale_date).toLowerCase().includes(lowerSearch)
      );
    }

    // Apply column filters
    if (filters.billingId) {
      filtered = filtered.filter((sale) =>
        formatBillingId(sale.id)
          .toLowerCase()
          .includes(filters.billingId.toLowerCase())
      );
    }

    if (filters.customerName) {
      filtered = filtered.filter((sale) =>
        sale.customers?.name
          .toLowerCase()
          .includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.email) {
      filtered = filtered.filter((sale) =>
        sale.customers?.email
          ?.toLowerCase()
          .includes(filters.email.toLowerCase())
      );
    }

    if (filters.phone) {
      filtered = filtered.filter((sale) =>
        sale.customers?.phone?.includes(filters.phone)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (sale) => new Date(sale.sale_date) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((sale) => new Date(sale.sale_date) <= toDate);
    }

    if (filters.gstMin) {
      filtered = filtered.filter(
        (sale) => sale.gst_amount >= parseFloat(filters.gstMin)
      );
    }

    if (filters.gstMax) {
      filtered = filtered.filter(
        (sale) => sale.gst_amount <= parseFloat(filters.gstMax)
      );
    }

    if (filters.discountMin) {
      filtered = filtered.filter(
        (sale) => (sale.discount_amount || 0) >= parseFloat(filters.discountMin)
      );
    }

    if (filters.discountMax) {
      filtered = filtered.filter(
        (sale) => (sale.discount_amount || 0) <= parseFloat(filters.discountMax)
      );
    }

    if (filters.totalMin) {
      filtered = filtered.filter(
        (sale) => sale.total_amount >= parseFloat(filters.totalMin)
      );
    }

    if (filters.totalMax) {
      filtered = filtered.filter(
        (sale) => sale.total_amount <= parseFloat(filters.totalMax)
      );
    }

    if (filters.customerType !== "all") {
      if (filters.customerType === "patient") {
        filtered = filtered.filter((sale) => sale.patient);
      } else if (filters.customerType === "customer") {
        filtered = filtered.filter((sale) => !sale.patient);
      }
    }

    return filtered;
  }, [sales, searchTerm, filters]);

  const { sortedData, requestSort, getSortIcon } = useSortable(filteredSales, {
    key: "sale_date",
    direction: "desc",
  });

  const pagination = usePagination(sortedData, pageSize);

  const toggleRow = (saleId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
  };

  //   const handleDownloadPDF = async (sale: Sale) => {
  //     try {
  //       const billingData = {
  //         billing_id: formatBillingId(sale.id),
  //         sale_date: new Date(sale.sale_date).toLocaleDateString("en-IN"),
  //         sale_time: new Date(sale.sale_date).toLocaleTimeString("en-IN"),
  //         customer_name: sale.customers?.name || "N/A",
  //         customer_phone: sale.customers?.phone,
  //         customer_email: sale.customers?.email,
  //         items: (sale.sale_items || []).map((item) => ({
  //           name: item.medicine_inventory?.name || "Unknown",
  //           quantity: item.quantity,
  //           unit_price: item.unit_price,
  //           total: item.total_price,
  //         })),
  //         subtotal: sale.subtotal,
  //         discount_amount: sale.discount_amount || 0,
  //         gst_amount: sale.gst_amount,
  //         total_amount: sale.total_amount,
  //         payment_status: sale.status,
  //         coupon_code: sale.coupon_code,
  //       };

  //       const pdfBlob = await generateBillingPDF(billingData);
  //       const url = URL.createObjectURL(pdfBlob);
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = `${formatBillingId(sale.id)}_${
  //         new Date().toISOString().split("T")[0]
  //       }.pdf`;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(url);

  //       toast({
  //         title: "Success",
  //         description: "Billing PDF downloaded successfully",
  //       });
  //     } catch (error) {
  //       console.error("Error generating PDF:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to generate PDF",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  return (
    <div className="space-y-6">
      {/* Sell Medicines Section */}
      <SellMedicines />

      {/* Billing History Section */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Billing History
              </CardTitle>
              <CardDescription>
                View all past transactions and sales records
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by billing ID, customer, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {Object.values(filters).some((v) => v && v !== "all") && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        {
                          Object.values(filters).filter((v) => v && v !== "all")
                            .length
                        }
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Filter Billing Records</DialogTitle>
                    <DialogDescription>
                      Apply filters to narrow down your billing history
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingId">Billing ID</Label>
                      <Input
                        id="billingId"
                        placeholder="BILL-..."
                        value={filters.billingId}
                        onChange={(e) =>
                          setFilters({ ...filters, billingId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerType">Customer Type</Label>
                      <Select
                        value={filters.customerType}
                        onValueChange={(value) =>
                          setFilters({ ...filters, customerType: value })
                        }
                      >
                        <SelectTrigger id="customerType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Name..."
                        value={filters.customerName}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            customerName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="Email..."
                        value={filters.email}
                        onChange={(e) =>
                          setFilters({ ...filters, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Phone..."
                        value={filters.phone}
                        onChange={(e) =>
                          setFilters({ ...filters, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Date From</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          setFilters({ ...filters, dateFrom: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Date To</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                          setFilters({ ...filters, dateTo: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GST Amount Range</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.gstMin}
                          onChange={(e) =>
                            setFilters({ ...filters, gstMin: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.gstMax}
                          onChange={(e) =>
                            setFilters({ ...filters, gstMax: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Range</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.discountMin}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              discountMin: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.discountMax}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              discountMax: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Total Amount Range</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.totalMin}
                          onChange={(e) =>
                            setFilters({ ...filters, totalMin: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.totalMax}
                          onChange={(e) =>
                            setFilters({ ...filters, totalMax: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          billingId: "",
                          customerName: "",
                          email: "",
                          phone: "",
                          dateFrom: "",
                          dateTo: "",
                          gstMin: "",
                          gstMax: "",
                          discountMin: "",
                          discountMax: "",
                          totalMin: "",
                          totalMax: "",
                          customerType: "all",
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading billing history...
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No billing history found
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort("id")}
                      >
                        <div className="flex items-center gap-2">
                          Billing ID
                          {getSortIcon("id")}
                        </div>
                      </TableHead>
                      <TableHead>Customer/Patient ID</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort("customers.name")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {getSortIcon("customers.name")}
                        </div>
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort("sale_date")}
                      >
                        <div className="flex items-center gap-2">
                          Date of Purchase
                          {getSortIcon("sale_date")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">GST</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort("total_amount")}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Total Price
                          {getSortIcon("total_amount")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((sale) => (
                      <>
                        <TableRow key={sale.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(sale.id)}
                              className="h-8 w-8 p-0"
                            >
                              {expandedRows.has(sale.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatBillingId(sale.id)}
                          </TableCell>
                          <TableCell>
                            {sale.patient ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-mono">
                                  PAT-{sale.patient.id.slice(0, 8)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="w-fit text-xs mt-1"
                                >
                                  Patient
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-mono">
                                  CUST-{sale.customer_id.slice(0, 8)}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="w-fit text-xs mt-1"
                                >
                                  Customer
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{sale.customers?.name || "N/A"}</TableCell>
                          <TableCell className="text-sm">
                            {sale.customers?.email || "N/A"}
                          </TableCell>
                          <TableCell>
                            {sale.customers?.phone || "N/A"}
                          </TableCell>
                          <TableCell>{formatDate(sale.sale_date)}</TableCell>
                          <TableCell className="text-right">
                            ₹{sale.gst_amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {sale.discount_amount &&
                            sale.discount_amount > 0 ? (
                              <div className="flex flex-col items-end">
                                <span className="text-green-600 dark:text-green-400">
                                  -₹{sale.discount_amount.toFixed(2)}
                                </span>
                                {sale.coupon_code && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    {sale.coupon_code}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ₹{sale.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(sale)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button> */}
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(sale.id) && (
                          <TableRow key={`${sale.id}-details`}>
                            <TableCell colSpan={11} className="bg-muted/30">
                              <div className="py-4 px-2">
                                <div className="text-sm font-semibold mb-3">
                                  Medicine Details
                                </div>
                                {sale.sale_items &&
                                sale.sale_items.length > 0 ? (
                                  <div className="space-y-2">
                                    {sale.sale_items.map((item, idx) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-background rounded border"
                                      >
                                        <div className="flex items-center gap-4 flex-1">
                                          <span className="text-muted-foreground text-sm w-8">
                                            {idx + 1}.
                                          </span>
                                          <div className="flex-1">
                                            <div className="font-medium">
                                              {item.medicine_inventory?.name ||
                                                "Unknown Medicine"}
                                            </div>
                                            {item.medicine_inventory
                                              ?.strength && (
                                              <div className="text-sm text-muted-foreground">
                                                Strength:{" "}
                                                {
                                                  item.medicine_inventory
                                                    .strength
                                                }
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                          <div className="text-right">
                                            <div className="text-muted-foreground">
                                              Unit Price
                                            </div>
                                            <div className="font-medium">
                                              ₹{item.unit_price.toFixed(2)}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-muted-foreground">
                                              Quantity
                                            </div>
                                            <div className="font-medium">
                                              {item.quantity}
                                            </div>
                                          </div>
                                          <div className="text-right min-w-[100px]">
                                            <div className="text-muted-foreground">
                                              Total
                                            </div>
                                            <div className="font-bold text-primary">
                                              ₹{item.total_price.toFixed(2)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="flex justify-end pt-3 border-t mt-3">
                                      <div className="space-y-1 min-w-[300px]">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Subtotal:
                                          </span>
                                          <span className="font-medium">
                                            ₹{sale.subtotal.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            GST:
                                          </span>
                                          <span className="font-medium">
                                            ₹{sale.gst_amount.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">
                                            Discount:
                                          </span>
                                          {sale.discount_amount &&
                                          sale.discount_amount > 0 ? (
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-green-600 dark:text-green-400">
                                                -₹
                                                {sale.discount_amount.toFixed(
                                                  2
                                                )}
                                              </span>
                                              {sale.coupon_code && (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {sale.coupon_code}
                                                </Badge>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="font-medium text-muted-foreground">
                                              -
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                                          <span>Total:</span>
                                          <span className="text-primary">
                                            ₹{sale.total_amount.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    No items found
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <TablePagination
                  {...pagination}
                  onPageSizeChange={(size) => setPageSize(size)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
