import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Package, Building2, AlertCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { VendorManagement } from "./VendorManagement";
import { updateInventory } from "@/api/services/inventory"; // add this import at top


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

type Supplier = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  price_per_unit?: number;
};

interface MedicineDetailDialogProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function MedicineDetailDialog({ medicine, isOpen, onClose, onUpdate }: MedicineDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState<Medicine | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showVendorManagement, setShowVendorManagement] = useState(false);

  useEffect(() => {
    if (medicine) {
      setEditedMedicine({ ...medicine });
      fetchSuppliers();
    }
  }, [medicine]);

  const fetchSuppliers = async () => {
    if (!medicine) return;
    
    const { data, error } = await supabase
      .from('medicine_suppliers')
      .select(`
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
      .eq('medicine_id', medicine.id);

    if (!error && data) {
      const supplierData = data.map(item => ({
        ...item.suppliers,
        price_per_unit: item.price_per_unit
      })) as Supplier[];
      setSuppliers(supplierData);
    }
  };

  const handleSave = async () => {
  if (!editedMedicine) return;

  try {
    // ✅ Call API to update this inventory item
    await updateInventory(editedMedicine.id, {
      brand_name: editedMedicine.name,
      generic_name: editedMedicine.generic_name,
      strength: editedMedicine.strength,
      form: editedMedicine.form,
      manufacturer: editedMedicine.manufacturer,
      quantity_available: editedMedicine.stock_quantity,
      expiry_date: editedMedicine.expiry_date,
      batch_number: editedMedicine.batch_number,
      storage_conditions: editedMedicine.storage_requirements,
      reorder_level: editedMedicine.reorder_level,
      location_code: editedMedicine.location_shelf_number,
      side_effects: editedMedicine.side_effects,
      usage_instructions: editedMedicine.usage_instructions,
      // map other fields from schema as needed
    });

    toast({ title: "Success", description: "Medicine updated successfully" });
    setIsEditing(false);
    onUpdate(); // refresh list in parent
  } catch (error) {
    toast({ title: "Error", description: "Failed to update medicine", variant: "destructive" });
    console.error(error);
  }
};
  
  
  
  // const handleSave = async () => {
  //   if (!editedMedicine) return;

  //   const { error } = await supabase
  //     .from('medicine_inventory')
  //     .update({
  //       name: editedMedicine.name,
  //       generic_name: editedMedicine.generic_name,
  //       strength: editedMedicine.strength,
  //       form: editedMedicine.form,
  //       manufacturer: editedMedicine.manufacturer,
  //       stock_quantity: editedMedicine.stock_quantity,
  //       expiry_date: editedMedicine.expiry_date,
  //       batch_number: editedMedicine.batch_number,
  //       storage_requirements: editedMedicine.storage_requirements,
  //       reorder_level: editedMedicine.reorder_level,
  //       location_shelf_number: editedMedicine.location_shelf_number,
  //       side_effects: editedMedicine.side_effects,
  //       usage_instructions: editedMedicine.usage_instructions,
  //       common_complaints: editedMedicine.common_complaints
  //     })
  //     .eq('id', editedMedicine.id);

  //   if (error) {
  //     toast({ title: "Error", description: "Failed to update medicine", variant: "destructive" });
  //   } else {
  //     toast({ title: "Success", description: "Medicine updated successfully" });
  //     setIsEditing(false);
  //     onUpdate();
  //   }
  // };

  const getStatusBadge = (med: Medicine) => {
    const isExpired = med.expiry_date && new Date(med.expiry_date) < new Date();
    if (med.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (med.stock_quantity <= (med.reorder_level || 10)) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-500 text-white">In Stock</Badge>;
  };

  if (!medicine || !editedMedicine) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Medicine Details</DialogTitle>
            <div className="flex gap-2">
              {getStatusBadge(editedMedicine)}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Medicine ID</Label>
                <Input 
                  value={editedMedicine.medicine_id || 'Auto-generated'} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editedMedicine.name}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Generic Name</Label>
                <Input
                  value={editedMedicine.generic_name || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, generic_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Strength/Dosage</Label>
                <Input
                  value={editedMedicine.strength || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, strength: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Form</Label>
                <Input
                  value={editedMedicine.form || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, form: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={editedMedicine.manufacturer || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, manufacturer: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Inventory & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={editedMedicine.stock_quantity}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, stock_quantity: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={editedMedicine.reorder_level || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, reorder_level: parseInt(e.target.value) || undefined })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Batch Number</Label>
                <Input
                  value={editedMedicine.batch_number || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, batch_number: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={editedMedicine.expiry_date || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, expiry_date: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Location/Shelf Number</Label>
                <Input
                  value={editedMedicine.location_shelf_number || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, location_shelf_number: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Storage Requirements</Label>
                <Input
                  value={editedMedicine.storage_requirements || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, storage_requirements: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Store at 2-8°C"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Usage Instructions</Label>
                <Textarea
                  value={editedMedicine.usage_instructions || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, usage_instructions: e.target.value })}
                  disabled={!isEditing}
                  placeholder="How to use this medicine..."
                />
              </div>
              <div>
                <Label>Side Effects</Label>
                <Textarea
                  value={editedMedicine.side_effects || ''}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, side_effects: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Known side effects..."
                />
              </div>
              {/* <div>
                <Label>Common Complaints</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedMedicine.common_complaints?.map((complaint, index) => (
                    <Badge key={index} variant="outline">
                      {complaint}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Input
                    className="mt-2"
                    placeholder="Add comma-separated complaints"
                    value={editedMedicine.common_complaints?.join(', ') || ''}
                    onChange={(e) => setEditedMedicine({ 
                      ...editedMedicine, 
                      common_complaints: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                  />
                )}
              </div> */}
            </CardContent>
          </Card>

          {/* Vendor Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Suppliers ({suppliers.length})
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVendorManagement(true)}
                >
                  Manage Suppliers
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suppliers.length > 0 ? (
                <div className="space-y-3">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{supplier.supplier_name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {supplier.supplier_id}</p>
                          {supplier.contact_person && (
                            <p className="text-sm text-muted-foreground">Contact: {supplier.contact_person}</p>
                          )}
                          {supplier.phone && (
                            <p className="text-sm text-muted-foreground">Phone: {supplier.phone}</p>
                          )}
                          {supplier.price_per_unit && (
                            <p className="text-sm font-medium">Price: ${supplier.price_per_unit}/unit</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No suppliers assigned to this medicine.</p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setEditedMedicine({ ...medicine });
                setIsEditing(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <VendorManagement
          medicineId={medicine.id}
          isOpen={showVendorManagement}
          onClose={() => setShowVendorManagement(false)}
          onUpdate={() => {
            fetchSuppliers();
            setShowVendorManagement(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}