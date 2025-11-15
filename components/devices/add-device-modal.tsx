"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AddGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void; // Callback opcional para refrescar la lista
}

export function AddGroupModal({ open, onOpenChange, onGroupCreated }: AddGroupModalProps) {
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    group_type: "general",
    description: "",
    color: "#6366f1" // Color por defecto
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Debes iniciar sesión para crear un grupo");
        setLoading(false);
        return;
      }

      // Insertar nuevo grupo en la tabla "sensor_groups"
      const { error } = await supabase.from("sensor_groups").insert([
        {
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          group_type: formData.group_type,
          color: formData.color,
          is_active: true,
        },
      ]);

      if (error) {
        console.error("Error al crear grupo:", error);
        toast.error(`Error al crear grupo: ${error.message}`);
      } else {
        toast.success("✅ Grupo creado exitosamente");
        // Resetear formulario
        setFormData({
          name: "",
          group_type: "general",
          description: "",
          color: "#6366f1"
        });

        // Cerrar modal y ejecutar callback si existe
        onOpenChange(false);
        if (onGroupCreated) {
          onGroupCreated();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Resetear formulario al cerrar
    setFormData({
      name: "",
      group_type: "general",
      description: "",
      color: "#6366f1"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo grupo de sensores</DialogTitle>
          <DialogDescription>
            Organiza tus sensores en grupos por tipo, ubicación o propósito.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del Grupo */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del grupo </Label>
            <Input
              id="name"
              placeholder="Ej: Monitoreo Humedad, Temperatura Exterior, etc."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Tipo de Grupo y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group_type">Tipo de grupo</Label>
              <Select
                value={formData.group_type}
                onValueChange={(value) => setFormData({ ...formData, group_type: value })}
              >
                <SelectTrigger id="group_type">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sensores_ambiental">Ambientales</SelectItem>
                  <SelectItem value="sensores_calidad_aire">Calidad de aire</SelectItem>
                  <SelectItem value="sensores_energía">Energía</SelectItem>
                  <SelectItem value="sensores_industrial">Industriales</SelectItem>
                  <SelectItem value="sensores_personalizado">Personalizado</SelectItem>
                  <SelectItem value="sensores_seguridad">Seguridad</SelectItem>
                  <SelectItem value="sensores_suelo">Suelo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color identificador</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 cursor-pointer rounded border border-slate-300"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1"
                  placeholder="#6366f1"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Describe el propósito de este grupo (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Preview del grupo */}
          <div className="p-3 border border-slate-600 rounded-lg bg-gray-400">
            <Label className="text-sm text-slate-600">Vista previa:</Label>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              ></div>
              <span className="font-medium">
                {formData.name || "Nombre del grupo"}
              </span>
              {formData.group_type && (
                <span className="text-xs bg-slate-500 px-2 py-1 rounded">
                  {formData.group_type}
                </span>
              )}
            </div>
            {formData.description && (
              <p className="text-sm text-slate-600 mt-1">{formData.description}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? "Creando..." : "Crear grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}