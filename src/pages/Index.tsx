
import { BookingForm } from "@/components/booking/BookingForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-restaurant-50 to-white">
      <main className="max-w-7xl mx-auto py-10">
        <BookingForm onStepChange={setCurrentStep} />
      </main>

      <footer className="bg-gray-100 p-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center text-muted-foreground text-sm mb-4">
            &copy; {new Date().getFullYear()} Tutti i diritti riservati
          </div>
          <Button
            className="bg-restaurant-500 hover:bg-restaurant-600 rounded-full h-12 w-12 shadow-lg"
            onClick={() => navigate("/admin/prenotazioni")}
            aria-label="Amministrazione"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default Index;
