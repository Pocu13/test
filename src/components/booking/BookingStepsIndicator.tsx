
import { cn } from "@/lib/utils";

interface BookingStepsIndicatorProps {
  currentStep: number;
}

export function BookingStepsIndicator({ currentStep }: BookingStepsIndicatorProps) {
  return (
    <div className="flex justify-between items-center relative max-w-2xl mx-auto mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex flex-col items-center relative z-10">
          <div 
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              currentStep === step 
                ? "border-restaurant-500 bg-restaurant-500 text-white scale-110 shadow-lg"
                : currentStep > step
                ? "bg-restaurant-500 border-restaurant-500 text-white"
                : "border-gray-300 text-gray-400"
            )}
          >
            {step}
          </div>
          
          {step < 3 && (
            <div 
              className={cn(
                "absolute top-6 left-[3rem] w-[calc(200% - 6rem)] h-0.5 transition-colors duration-300",
                currentStep > step
                  ? "bg-restaurant-500" 
                  : "bg-gray-300"
              )}
            />
          )}
          
          <span className={cn(
            "mt-2 text-sm font-medium transition-colors duration-300",
            currentStep === step 
              ? "text-restaurant-600"
              : "text-gray-500"
          )}>
            {step === 1 ? "Persone" : step === 2 ? "Data e Ora" : "Conferma"}
          </span>
        </div>
      ))}
    </div>
  );
}
