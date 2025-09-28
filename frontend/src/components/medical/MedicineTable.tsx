import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Medicine, MedicineInventory } from "@/types/medical";

interface MedicineTableProps {
  medicines: Medicine[];
  onChange: (medicines: Medicine[]) => void;
  complaints: string[];
}

// Mock medicine inventory - in real app, this would come from backend
const medicineInventory: MedicineInventory[] = [
  {
    id: "1",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    strength: "500mg",
    form: "Tablet",
    manufacturer: "PharmaCorp",
    stockQuantity: 100,
    expiryDate: "2025-12-31",
    batchNumber: "PC001",
    commonComplaints: ["fever", "headache", "bodyache", "pain"],
  },
  {
    id: "2",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    strength: "400mg",
    form: "Tablet",
    manufacturer: "MediLab",
    stockQuantity: 75,
    expiryDate: "2025-10-15",
    batchNumber: "ML002",
    commonComplaints: ["pain", "inflammation", "fever", "headache"],
  },
  {
    id: "3",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    strength: "250mg",
    form: "Capsule",
    manufacturer: "BioMed",
    stockQuantity: 50,
    expiryDate: "2025-08-20",
    batchNumber: "BM003",
    commonComplaints: ["infection", "cough", "cold", "throat pain"],
  },
  {
    id: "4",
    name: "Cetirizine",
    genericName: "Cetirizine HCl",
    strength: "10mg",
    form: "Tablet",
    manufacturer: "AllerMed",
    stockQuantity: 60,
    expiryDate: "2025-09-30",
    batchNumber: "AM004",
    commonComplaints: ["allergy", "itching", "runny nose", "sneezing"],
  },
  {
    id: "5",
    name: "Omeprazole",
    genericName: "Omeprazole",
    strength: "20mg",
    form: "Capsule",
    manufacturer: "GastroMed",
    stockQuantity: 40,
    expiryDate: "2025-11-15",
    batchNumber: "GM005",
    commonComplaints: ["acidity", "heartburn", "stomach pain", "indigestion"],
  },
];

export function MedicineTable({
  medicines,
  onChange,
  complaints,
}: MedicineTableProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({});
  const [suggestions, setSuggestions] = useState<MedicineInventory[]>([]);

  // Get suggested medicines based on complaints
  const getSuggestedMedicines = () => {
    if (complaints.length === 0) return [];

    return medicineInventory.filter((med) =>
      med.commonComplaints.some((complaint) =>
        complaints.some(
          (userComplaint) =>
            complaint.toLowerCase().includes(userComplaint.toLowerCase()) ||
            userComplaint.toLowerCase().includes(complaint.toLowerCase())
        )
      )
    );
  };

  const handleAddMedicine = () => {
    if (
      newMedicine.name &&
      newMedicine.dosage &&
      newMedicine.timeFreqDuration
    ) {
      const medicine: Medicine = {
        id: Date.now().toString(),
        name: newMedicine.name,
        dosage: newMedicine.dosage,
        timeFreqDuration: newMedicine.timeFreqDuration,
        notes: newMedicine.notes || "",
        availableInInventory: medicineInventory.some(
          (inv) => inv.name.toLowerCase() === newMedicine.name?.toLowerCase()
        ),
        relatedComplaints: complaints,
      };

      onChange([...medicines, medicine]);
      setNewMedicine({});
      setIsAddingNew(false);
    }
  };

  const handleEditMedicine = (id: string, updates: Partial<Medicine>) => {
    const updatedMedicines = medicines.map((med) =>
      med.id === id ? { ...med, ...updates } : med
    );
    onChange(updatedMedicines);
    setEditingId(null);
  };

  const handleDeleteMedicine = (id: string) => {
    const updatedMedicines = medicines.filter((med) => med.id !== id);
    onChange(updatedMedicines);
  };

  const searchMedicine = (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const filtered = medicineInventory.filter(
      (med) =>
        med.name.toLowerCase().includes(query.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  // Auto-add suggested medicines based on complaints
  const addSuggestedMedicines = () => {
    const suggested = getSuggestedMedicines();
    const newMedicines = suggested
      .filter((inv) => !medicines.some((med) => med.name === inv.name))
      .map((inv) => ({
        id: Date.now().toString() + Math.random(),
        name: inv.name,
        dosage: inv.strength,
        timeFreqDuration: "1-1-1 for 5 days",
        notes: `Generic: ${inv.genericName}`,
        availableInInventory: true,
        relatedComplaints: complaints.filter((complaint) =>
          inv.commonComplaints.includes(complaint)
        ),
      }));

    if (newMedicines.length > 0) {
      onChange([...medicines, ...newMedicines]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Medicines Prescribed</h3>
          {complaints.length > 0 && getSuggestedMedicines().length > 0 && (
            <Button
              onClick={addSuggestedMedicines}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Add Suggested ({getSuggestedMedicines().length})
            </Button>
          )}
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          variant="medical"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Medicine</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Time-Freq-Duration</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell>
                  {editingId === medicine.id ? (
                    <div className="relative">
                      <Input
                        value={medicine.name}
                        onChange={(e) => {
                          handleEditMedicine(medicine.id, {
                            name: e.target.value,
                          });
                          searchMedicine(e.target.value);
                        }}
                        className="w-full"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-32 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="p-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => {
                                handleEditMedicine(medicine.id, {
                                  name: suggestion.name,
                                });
                                setSuggestions([]);
                              }}
                            >
                              <div className="font-medium">
                                {suggestion.name}
                              </div>
                              <div className="text-muted-foreground">
                                {suggestion.genericName} - {suggestion.strength}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="font-medium">{medicine.name}</div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === medicine.id ? (
                    <Input
                      value={medicine.dosage}
                      onChange={(e) =>
                        handleEditMedicine(medicine.id, {
                          dosage: e.target.value,
                        })
                      }
                    />
                  ) : (
                    medicine.dosage
                  )}
                </TableCell>
                <TableCell>
                  {editingId === medicine.id ? (
                    <Input
                      value={medicine.timeFreqDuration}
                      onChange={(e) =>
                        handleEditMedicine(medicine.id, {
                          timeFreqDuration: e.target.value,
                        })
                      }
                    />
                  ) : (
                    medicine.timeFreqDuration
                  )}
                </TableCell>
                <TableCell>
                  {editingId === medicine.id ? (
                    <Textarea
                      value={medicine.notes || ""}
                      onChange={(e) =>
                        handleEditMedicine(medicine.id, {
                          notes: e.target.value,
                        })
                      }
                      className="min-h-[60px]"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {medicine.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        medicine.availableInInventory ? "default" : "secondary"
                      }
                      className={
                        medicine.availableInInventory
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      }
                    >
                      {medicine.availableInInventory
                        ? "Available"
                        : "Not in Stock"}
                    </Badge>
                    {medicine.notes?.includes("Auto-suggested") && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        AI Suggested
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {editingId === medicine.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8"
                        >
                          <Check className="w-4 h-4 text-success" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(medicine.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {isAddingNew && (
              <TableRow>
                <TableCell>
                  <div className="relative">
                    <Input
                      placeholder="Medicine name"
                      value={newMedicine.name || ""}
                      onChange={(e) => {
                        setNewMedicine({
                          ...newMedicine,
                          name: e.target.value,
                        });
                        searchMedicine(e.target.value);
                      }}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-32 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="p-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => {
                              setNewMedicine({
                                ...newMedicine,
                                name: suggestion.name,
                              });
                              setSuggestions([]);
                            }}
                          >
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="text-muted-foreground">
                              {suggestion.genericName} - {suggestion.strength}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Dosage"
                    value={newMedicine.dosage || ""}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, dosage: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="e.g., 1-1-1 for 5 days"
                    value={newMedicine.timeFreqDuration || ""}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        timeFreqDuration: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Notes"
                    value={newMedicine.notes || ""}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, notes: e.target.value })
                    }
                    className="min-h-[60px]"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Checking...
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleAddMedicine}
                      className="h-8 w-8"
                    >
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewMedicine({});
                      }}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {medicines.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No medicines prescribed yet.</p>
          <p className="text-sm">
            Add medicines based on patient complaints above.
          </p>
        </div>
      )}
    </div>
  );
}
