import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Package, AlertTriangle, Plus, Download, Filter, ArrowUpCircle, ArrowDownCircle, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useSortable } from "@/hooks/useSortable";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { cache } from "@/lib/cache";
import { TableSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";
import { MedicineDetailDialog } from "@/components/medical/MedicineDetailDialog";
import { getInventory } from "@/api/services/inventory";

type Medicine = {
  id: string;
  medicine_id?: string;
  name: string;
  generic_name?: string;
  strength?: string;
  form?: string;
  manufacturer?: string;
  stock_quantity: number;
  expiry_date?: string;
  batch_number?: string;
  storage_requirements?: string;
  reorder_level?: number;
  location_shelf_number?: string;
  side_effects?: string;
  usage_instructions?: string;
  common_complaints: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type Transaction = {
  id: string;
  inventory_id: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  notes?: string;
  created_at: string;
  medicine_inventory?: { name: string };
};

export default function MedicineStock() {

  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [transactionType, setTransactionType] = useState<'in' | 'out' | 'adjust'>('in');
  const [transactionQuantity, setTransactionQuantity] = useState('');
  const [transactionNotes, setTransactionNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  
  // Add Medicine dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState<Medicine | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    generic_name: '',
    strength: '',
    form: 'Tablet',
    manufacturer: '',
    stock_quantity: '',
    expiry_date: '',
    batch_number: '',
    storage_requirements: '',
    reorder_level: '',
    location_shelf_number: '',
    side_effects: '',
    usage_instructions: '',
    common_complaints: '',
    active: true,
  });

  useEffect(() => {

    fetchMedicines();
    fetchTransactions();
    
    // Subscribe to realtime changes
    const medicineChannel = supabase
      .channel('medicine-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'medicine_inventory' },
        () => {
          cache.invalidate('medicine-inventory');
          fetchMedicines();
        }
      )
      .subscribe();

    const transactionChannel = supabase
      .channel('transaction-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'inventory_transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(medicineChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, []);

    const fetchMedicines = async () => {
      try {
        const data = await getInventory();
        console.log("Fetched medicines from API:", data);

        const mapped = (data || []).map((row: any) => ({
          id: row._id, // since MongoDB uses _id
          medicine_id: row._id,
          name: row.brand_name,  // Need to look at this if its not replicating 
          generic_name: row.generic_name,
          strength: row.strength,
          form: row.form,
          manufacturer: row.manufacturer,
          stock_quantity: row.quantity_available ?? 0,
          expiry_date: row.expiry_date,
          batch_number: row.batch_number,
          storage_requirements: row.storage_conditions,
          reorder_level: row.reorder_level,
          location_shelf_number: row.location_code,
          side_effects: row.side_effects,
          usage_instructions: row.usage_instructions,
          common_complaints: row.common_complaints ?? [],
          active: row.active ?? true,
          created_at: row.createdAt,
        })) as Medicine[];

        setMedicines(mapped);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        toast({
          title: "Error",
          description: "Failed to fetch medicines",
          variant: "destructive",
        });
      }
    };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*, medicine_inventory(name)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      toast({ title: "Error", description: "Failed to fetch transactions", variant: "destructive" });
    } else {
      setTransactions((data || []) as Transaction[]);
    }
  };

  const handleTransaction = async () => {
    if (!selectedMedicine || !transactionQuantity) return;

    const quantity = parseInt(transactionQuantity);
    let newStock = selectedMedicine.stock_quantity;

    if (transactionType === 'in') {
      newStock += quantity;
    } else if (transactionType === 'out') {
      newStock = Math.max(0, newStock - quantity);
    } else if (transactionType === 'adjust') {
      newStock = quantity;
    }

    try {
      // Insert transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_id: selectedMedicine.id,
          type: transactionType,
          quantity: transactionType === 'adjust' ? quantity - selectedMedicine.stock_quantity : quantity,
          notes: transactionNotes
        });

      if (transactionError) throw transactionError;

      // Update inventory
      const { error: updateError } = await supabase
        .from('medicine_inventory')
        .update({ stock_quantity: newStock })
        .eq('id', selectedMedicine.id);

      if (updateError) throw updateError;

      toast({ title: "Success", description: "Transaction recorded successfully!" });
      setIsDialogOpen(false);
      setTransactionQuantity('');
      setTransactionNotes('');
      setSelectedMedicine(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to record transaction", variant: "destructive" });
    }
  };

  const handleToggleActive = async (medicine: Medicine, value: boolean) => {
    const { error } = await supabase
      .from('medicine_inventory')
      .update({ active: value })
      .eq('id', medicine.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `${medicine.name} ${value ? 'enabled' : 'disabled'}.` });
    }
  };

  const handleCreateMedicine = async () => {
    if (!newMed.name.trim()) {
      toast({ title: 'Name is required', description: 'Please enter a medicine name', variant: 'destructive' });
      return;
    }
    const payload = {
      name: newMed.name.trim(),
      generic_name: newMed.generic_name.trim() || null,
      strength: newMed.strength.trim() || null,
      form: newMed.form.trim() || null,
      manufacturer: newMed.manufacturer.trim() || null,
      stock_quantity: parseInt(newMed.stock_quantity || '0', 10),
      expiry_date: newMed.expiry_date ? newMed.expiry_date : null,
      batch_number: newMed.batch_number.trim() || null,
      common_complaints: newMed.common_complaints
        ? newMed.common_complaints.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      active: newMed.active,
    } as any;
    const { error } = await supabase.from('medicine_inventory').insert(payload);
    if (error) {
      toast({ title: 'Error', description: 'Failed to create medicine', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Medicine created successfully' });
      setIsAddOpen(false);
      setNewMed({ 
        name: '', 
        generic_name: '', 
        strength: '', 
        form: 'Tablet', 
        manufacturer: '', 
        stock_quantity: '', 
        expiry_date: '', 
        batch_number: '', 
        storage_requirements: '', 
        reorder_level: '', 
        location_shelf_number: '', 
        side_effects: '', 
        usage_instructions: '', 
        common_complaints: '', 
        active: true 
      });
      fetchMedicines();
    }
  };

  console.log("There is a medicine", medicines);
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortedData, requestSort, getSortIcon } = useSortable(filteredMedicines);
  const pagination = usePagination(sortedData, pageSize);

  const getStatusBadge = (medicine: Medicine) => {
    if (medicine.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    const isExpired = medicine.expiry_date && new Date(medicine.expiry_date) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (medicine.stock_quantity <= (medicine.reorder_level || 10)) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-500 text-white">In Stock</Badge>;
  };

  const lowStockCount = medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity <= (m.reorder_level || 10) && (!m.expiry_date || new Date(m.expiry_date) >= new Date())).length;
  const expiredCount = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < new Date()).length;
  const outOfStockCount = medicines.filter(m => m.stock_quantity === 0).length;

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medicine Stock</h1>
          <p className="text-muted-foreground">Monitor and manage hospital medication inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-border">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
                <DialogDescription>Create a medicine record in inventory</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} />
                </div>
                <div>
                  <Label>Generic Name</Label>
                  <Input value={newMed.generic_name} onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })} />
                </div>
                <div>
                  <Label>Strength</Label>
                  <Input value={newMed.strength} onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })} />
                </div>
                <div>
                  <Label>Form</Label>
                  <Input value={newMed.form} onChange={(e) => setNewMed({ ...newMed, form: e.target.value })} placeholder="Tablet / Capsule / Syrup / Injection" />
                </div>
                <div>
                  <Label>Manufacturer</Label>
                  <Input value={newMed.manufacturer} onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })} />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={newMed.stock_quantity} onChange={(e) => setNewMed({ ...newMed, stock_quantity: e.target.value })} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={newMed.expiry_date} onChange={(e) => setNewMed({ ...newMed, expiry_date: e.target.value })} />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input value={newMed.batch_number} onChange={(e) => setNewMed({ ...newMed, batch_number: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Common Complaints (comma separated)</Label>
                  <Input value={newMed.common_complaints} onChange={(e) => setNewMed({ ...newMed, common_complaints: e.target.value })} placeholder="fever, cough, headache" />
                </div>
                <div className="flex items-center justify-between md:col-span-2">
                  <Label>Active</Label>
                  <Switch checked={newMed.active} onCheckedChange={(v) => setNewMed({ ...newMed, active: v })} />
                </div>
              </div>
              <Button onClick={handleCreateMedicine} className="w-full">Create Medicine</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{medicines.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {medicines.filter(m => m.stock_quantity > (m.reorder_level || 10) && (!m.expiry_date || new Date(m.expiry_date) >= new Date())).length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicine Inventory Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Medicine Inventory
          </CardTitle>
          <CardDescription>Complete list of all medicines in stock with detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('name')}
                    >
                      Medicine
                      {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('generic_name')}
                    >
                      Generic Name
                      {getSortIcon('generic_name')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('strength')}
                    >
                      Strength
                      {getSortIcon('strength')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('form')}
                    >
                      Form
                      {getSortIcon('form')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('stock_quantity')}
                    >
                      Stock
                      {getSortIcon('stock_quantity')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('expiry_date')}
                    >
                      Expiry
                      {getSortIcon('expiry_date')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('batch_number')}
                    >
                      Batch
                      {getSortIcon('batch_number')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('active')}
                    >
                      Active
                      {getSortIcon('active')}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedData.map((medicine) => (
                  <tr key={medicine.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{medicine.name}</div>
                        <div className="text-sm text-muted-foreground">{medicine.manufacturer}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {medicine.common_complaints.slice(0, 3).join(', ')}
                          {medicine.common_complaints.length > 3 && '...'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{medicine.generic_name || '-'}</td>
                    <td className="py-4 px-4 text-sm font-medium">{medicine.strength || '-'}</td>
                    <td className="py-4 px-4 text-sm">{medicine.form || '-'}</td>
                    <td className="py-4 px-4 font-medium">{medicine.stock_quantity}</td>
                    <td className="py-4 px-4 text-sm">
                      {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm">{medicine.batch_number || '-'}</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(medicine)}
                    </td>
                    <td className="py-4 px-4">
                      <Switch 
                        checked={medicine.active} 
                        onCheckedChange={(value) => handleToggleActive(medicine, value)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedMedicineDetail(medicine);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Dialog open={isDialogOpen && selectedMedicine?.id === medicine.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (open) setSelectedMedicine(medicine);
                          else setSelectedMedicine(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock: {medicine.name}</DialogTitle>
                            <DialogDescription>Record inventory transaction</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Transaction Type</Label>
                              <Select value={transactionType} onValueChange={(value: 'in' | 'out' | 'adjust') => setTransactionType(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in">Stock In</SelectItem>
                                  <SelectItem value="out">Stock Out</SelectItem>
                                  <SelectItem value="adjust">Adjust Stock</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <Input 
                                type="number" 
                                value={transactionQuantity}
                                onChange={(e) => setTransactionQuantity(e.target.value)}
                                placeholder={transactionType === 'adjust' ? 'New stock level' : 'Quantity'}
                              />
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Input 
                                value={transactionNotes}
                                onChange={(e) => setTransactionNotes(e.target.value)}
                                placeholder="Optional notes"
                              />
                            </div>
                            <Button onClick={handleTransaction} className="w-full">
                              Record Transaction
                            </Button>
                          </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination 
              {...pagination}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        </CardContent>
      </Card>
      
      <MedicineDetailDialog
        medicine={selectedMedicineDetail}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedMedicineDetail(null);
        }}
        onUpdate={fetchMedicines}
      />
    </div>
  );
}