import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Wand2,
  Settings,
  Info,
} from "lucide-react";
// import { uploadSampleTemplates } from "@/lib/sampleTemplates";
// import { PdfTemplateEditor } from "@/components/templates/PdfTemplateEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Template {
  id?: string;
  name: string;
  description: string | null;
  template_type: "prescription" | "billing";
  file_url: string;
  file_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function TemplatesManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingSamples, setGeneratingSamples] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "prescription" as "prescription" | "billing",
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTemplates((data as Template[]) || []);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid PDF file");
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.error("Template name is required");
    if (!editingTemplate && !selectedFile)
      return toast.error("Please upload a PDF file");

    setUploading(true);
    try {
      let fileUrl = editingTemplate?.file_url || "";
      let fileName = editingTemplate?.file_name || "";

      if (selectedFile) {
        const filePath = `${crypto.randomUUID()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("templates")
          .upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        fileUrl = filePath;
        fileName = selectedFile.name;
      }

      const templateData = {
        ...formData,
        file_url: fileUrl,
        file_name: fileName,
      };
      if (editingTemplate) {
        await supabase
          .from("templates")
          .update(templateData)
          .eq("id", editingTemplate.id);
        toast.success("Template updated successfully");
      } else {
        const { data: inserted, error } = await supabase
          .from("templates")
          .insert(templateData)
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Template created successfully");
        if (selectedFile && inserted) {
          setIsDialogOpen(false);
          setCurrentTemplateId(inserted.id);
          setShowEditor(true);
          return;
        }
      }

      resetForm();
      setIsDialogOpen(false);
      loadTemplates();
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      template_type: "prescription",
      is_active: true,
    });
    setSelectedFile(null);
    setEditingTemplate(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-muted-foreground">
        Loading templates...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates Management</h1>
            <p className="text-muted-foreground mt-1">
              Easily upload and configure your PDF templates for{" "}
              <b>Prescriptions</b> or <b>Billing</b>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadTemplates()}>
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerateSamples()}
              disabled={generatingSamples}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {generatingSamples ? "Generating..." : "Generate Samples"}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate
                      ? "Edit Template Details"
                      : "Create a New Template"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Fill in the details carefully — you can edit or configure
                    the template anytime later.
                  </p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  <Card className="shadow-sm border border-muted/30">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        📝 Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Template Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g., Standard Prescription Layout"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          A short and descriptive name to identify this
                          template.
                        </p>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          placeholder="Briefly describe this template’s purpose"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Template Type *</Label>
                        <Select
                          value={formData.template_type}
                          onValueChange={(value: "prescription" | "billing") =>
                            setFormData({ ...formData, template_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prescription">
                              Prescription Template
                            </SelectItem>
                            <SelectItem value="billing">
                              Billing Template
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(v) =>
                            setFormData({ ...formData, is_active: v })
                          }
                        />
                        <Label>Active Template</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upload Section */}
                  <Card className="shadow-sm border border-muted/30">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        📄 Upload Template File
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Label>Upload PDF File *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected File: {selectedFile.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={uploading}>
                      {uploading
                        ? "Saving..."
                        : editingTemplate
                        ? "Update Template"
                        : "Create Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Template Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No templates found yet.</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Add your first template
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow
                      key={template.id}
                      className="hover:bg-muted/40 transition"
                    >
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        <Badge>{template.template_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.description || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.file_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.is_active ? "default" : "secondary"}
                        >
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Configure template fields"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
