import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Users, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Supplier = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  license_number?: string;
};

type MedicineSupplier = {
  id: string;
  supplier_id: string;
  price_per_unit?: number;
  supplier: Supplier;
};

interface VendorManagementProps {
  medicineId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function VendorManagement({ medicineId, isOpen, onClose, onUpdate }: VendorManagementProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicineSuppliers, setMedicineSuppliers] = useState<MedicineSupplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [pricePerUnit, setPricePerUnit] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    license_number: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchMedicineSuppliers();
    }
  }, [isOpen, medicineId]);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_name');
    
    if (!error && data) {
      setSuppliers(data);
    }
  };

  const fetchMedicineSuppliers = async () => {
    const { data, error } = await supabase
      .from('medicine_suppliers')
      .select(`
        id,
        price_per_unit,
        suppliers (
          id,
          supplier_id,
          supplier_name,
          contact_person,
          phone,
          email,
          license_number
        )
      `)
      .eq('medicine_id', medicineId);

    if (!error && data) {
      const formatted = data.map(item => ({
        id: item.id,
        supplier_id: item.suppliers.id,
        price_per_unit: item.price_per_unit,
        supplier: item.suppliers
      })) as MedicineSupplier[];
      setMedicineSuppliers(formatted);
    }
  };

  const generateSupplierId = () => {
    // Simple generation for now
    const count = suppliers.length + 1;
    return `SUP${String(count).padStart(4, '0')}`;
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplier.supplier_name.trim()) {
      toast({ title: "Error", description: "Supplier name is required", variant: "destructive" });
      return;
    }

    const supplierId = generateSupplierId();
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        supplier_id: supplierId,
        supplier_name: newSupplier.supplier_name,
        contact_person: newSupplier.contact_person || null,
        phone: newSupplier.phone || null,
        email: newSupplier.email || null,
        license_number: newSupplier.license_number || null
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Supplier created successfully" });
    setNewSupplier({
      supplier_name: '',
      contact_person: '',
      phone: '',
      email: '',
      license_number: ''
    });
    setIsAddingNew(false);
    fetchSuppliers();
  };

  const handleAssignSupplier = async () => {
    if (!selectedSupplierId) {
      toast({ title: "Error", description: "Please select a supplier", variant: "destructive" });
      return;
    }

    // Check if supplier already assigned
    const alreadyAssigned = medicineSuppliers.some(ms => ms.supplier_id === selectedSupplierId);
    if (alreadyAssigned) {
      toast({ title: "Error", description: "Supplier already assigned to this medicine", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('medicine_suppliers')
      .insert({
        medicine_id: medicineId,
        supplier_id: selectedSupplierId,
        price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : null
      });

    if (error) {
      toast({ title: "Error", description: "Failed to assign supplier", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Supplier assigned successfully" });
    setSelectedSupplierId("");
    setPricePerUnit("");
    fetchMedicineSuppliers();
  };

  const handleRemoveSupplier = async (medicineSupplierI: string) => {
    const { error } = await supabase
      .from('medicine_suppliers')
      .delete()
      .eq('id', medicineSupplierI);

    if (error) {
      toast({ title: "Error", description: "Failed to remove supplier", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Supplier removed successfully" });
    fetchMedicineSuppliers();
  };

  const availableSuppliers = suppliers.filter(
    supplier => !medicineSuppliers.some(ms => ms.supplier_id === supplier.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Suppliers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assign Existing Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assign Existing Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Select Supplier</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.supplier_name} ({supplier.supplier_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price per Unit ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button onClick={handleAssignSupplier} disabled={!selectedSupplierId}>
                Assign Supplier
              </Button>
            </CardContent>
          </Card>

          {/* Add New Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Add New Supplier
                </span>
                {!isAddingNew && (
                  <Button variant="outline" onClick={() => setIsAddingNew(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Supplier
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {isAddingNew && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier Name *</Label>
                    <Input
                      value={newSupplier.supplier_name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, supplier_name: e.target.value })}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input
                      value={newSupplier.contact_person}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>License Number</Label>
                    <Input
                      value={newSupplier.license_number}
                      onChange={(e) => setNewSupplier({ ...newSupplier, license_number: e.target.value })}
                      placeholder="License number"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNewSupplier}>
                    Create Supplier
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Current Suppliers */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Suppliers ({medicineSuppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {medicineSuppliers.length > 0 ? (
                <div className="space-y-3">
                  {medicineSuppliers.map((ms) => (
                    <div key={ms.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{ms.supplier.supplier_name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {ms.supplier.supplier_id}</p>
                          {ms.supplier.contact_person && (
                            <p className="text-sm text-muted-foreground">Contact: {ms.supplier.contact_person}</p>
                          )}
                          <div className="flex gap-4 mt-2">
                            {ms.supplier.phone && (
                              <span className="text-sm text-muted-foreground">📞 {ms.supplier.phone}</span>
                            )}
                            {ms.supplier.email && (
                              <span className="text-sm text-muted-foreground">✉️ {ms.supplier.email}</span>
                            )}
                          </div>
                          {ms.price_per_unit && (
                            <p className="text-sm font-medium mt-2">Price: ${ms.price_per_unit}/unit</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSupplier(ms.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No suppliers assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => { onUpdate(); onClose(); }}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}