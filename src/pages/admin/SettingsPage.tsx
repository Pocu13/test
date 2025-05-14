
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Button>
      </div>
      <SettingsForm />
    </div>
  );
}
