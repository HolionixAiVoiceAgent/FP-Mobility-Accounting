import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export const TaxIntegrationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ["tax-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tax_integrations").select("*");
      if (error) throw error;
      return data;
    },
  });

  const datevIntegration = integrations?.find((i) => i.integration_type === "datev");
  const lexofficeIntegration = integrations?.find((i) => i.integration_type === "lexoffice");

  const updateIntegration = useMutation({
    mutationFn: async ({
      type,
      updates,
    }: {
      type: "datev" | "lexoffice";
      updates: { api_key?: string; consultant_id?: string; is_active?: boolean; sync_frequency?: string };
    }) => {
      const existing = integrations?.find((i) => i.integration_type === type);

      if (existing) {
        const { data, error } = await supabase
          .from("tax_integrations")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("tax_integrations")
          .insert([{ integration_type: type, ...updates }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-integrations"] });
      toast({
        title: "Success",
        description: "Tax integration settings updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* DATEV Integration */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">DATEV Export</h3>
            </div>
            <div className="flex items-center gap-2">
              {datevIntegration?.is_active ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Disabled
                </Badge>
              )}
              <Switch
                checked={datevIntegration?.is_active || false}
                onCheckedChange={(checked) =>
                  updateIntegration.mutate({
                    type: "datev",
                    updates: { is_active: checked },
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="datev-consultant">Consultant ID</Label>
              <Input
                id="datev-consultant"
                placeholder="Enter DATEV consultant ID"
                defaultValue={datevIntegration?.consultant_id || ""}
                onBlur={(e) =>
                  e.target.value &&
                  updateIntegration.mutate({
                    type: "datev",
                    updates: { consultant_id: e.target.value },
                  })
                }
              />
            </div>

            {datevIntegration?.last_sync_at && (
              <p className="text-sm text-muted-foreground">
                Last exported: {new Date(datevIntegration.last_sync_at).toLocaleString("de-DE")}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Lexoffice Integration */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Lexoffice Integration</h3>
            </div>
            <div className="flex items-center gap-2">
              {lexofficeIntegration?.is_active ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
              <Switch
                checked={lexofficeIntegration?.is_active || false}
                onCheckedChange={(checked) =>
                  updateIntegration.mutate({
                    type: "lexoffice",
                    updates: { is_active: checked },
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="lexoffice-key">API Key</Label>
              <Input
                id="lexoffice-key"
                type="password"
                placeholder="Enter Lexoffice API key"
                defaultValue={lexofficeIntegration?.api_key ? "••••••••••••" : ""}
                onBlur={(e) =>
                  e.target.value &&
                  !e.target.value.includes("•") &&
                  updateIntegration.mutate({
                    type: "lexoffice",
                    updates: { api_key: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lexoffice-frequency">Sync Frequency</Label>
              <Select
                value={lexofficeIntegration?.sync_frequency || "manual"}
                onValueChange={(value) =>
                  updateIntegration.mutate({
                    type: "lexoffice",
                    updates: { sync_frequency: value },
                  })
                }
              >
                <SelectTrigger id="lexoffice-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lexofficeIntegration?.last_sync_at && (
              <p className="text-sm text-muted-foreground">
                Last synced: {new Date(lexofficeIntegration.last_sync_at).toLocaleString("de-DE")}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
