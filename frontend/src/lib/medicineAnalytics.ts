import { supabase } from "@/integrations/supabase/client";
import { Medicine } from "@/types/medical";
import { getPrescriptionsByDoctorId } from "@/api/services/prescriptionService";

export interface MedicineSuggestion extends Medicine {
  confidence: number;
  frequency: number;
  lastPrescribed: string;
}

export async function getDoctorMedicineSuggestions(
  doctorId: string,
  complaints: string[]
): Promise<MedicineSuggestion[]> {
  try {
    console.log("getDoctorMedicineSuggestions called with:", {
      doctorId,
      complaints,
    });

    // Get doctor's prescriptions from last 30 days, prioritizing recent ones
    // const thirtyDaysAgo = new Date();
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // console.log(
    //   "Looking for prescriptions after:",
    //   thirtyDaysAgo.toISOString().split("T")[0]
    // );

    // const { data: prescriptions, error } = await supabase
    //   .from("prescriptions")
    //   .select("medicines, complaints, visit_date")
    //   .eq("doctor_id", doctorId)
    //   .gte("visit_date", thirtyDaysAgo.toISOString().split("T")[0])
    //   .order("visit_date", { ascending: false });

    // if (error) throw error;

    const prescriptions = await getPrescriptionsByDoctorId(doctorId);

    console.log("Found prescriptions:", prescriptions?.length || 0);
    console.log("Prescription data:", prescriptions);

    // Analyze medicine patterns for given complaints
    const medicinePatterns = new Map<
      string,
      {
        medicine: Medicine;
        frequency: number;
        lastPrescribed: string;
        complaintsMatch: number;
      }
    >();

    prescriptions?.forEach((prescription: any) => {
      const prescComplaints = Array.isArray(prescription.complaints)
        ? prescription.complaints
        : [];
      const medicines = Array.isArray(prescription.medicines)
        ? prescription.medicines
        : [];

      // Check how many complaints match
      const matchingComplaints = complaints.filter((complaint) =>
        prescComplaints.some((pComplaint: string) => {
          const cleanComplaint = complaint.toLowerCase().replace("#", "");
          const cleanPrescComplaint = pComplaint.toLowerCase().replace("#", "");
          return (
            cleanComplaint.includes(cleanPrescComplaint) ||
            cleanPrescComplaint.includes(cleanComplaint)
          );
        })
      );

      console.log("Checking complaint match:", {
        inputComplaints: complaints,
        prescriptionComplaints: prescComplaints,
        matchingComplaints,
      });

      if (matchingComplaints.length > 0) {
        medicines.forEach((medicine: Medicine) => {
          const key = medicine.name.toLowerCase();
          const existing = medicinePatterns.get(key);

          if (existing) {
            existing.frequency += 1;
            existing.complaintsMatch += matchingComplaints.length;
            // Update last prescribed date if more recent
            if (prescription.visit_date > existing.lastPrescribed) {
              existing.lastPrescribed = prescription.visit_date;
            }
          } else {
            medicinePatterns.set(key, {
              medicine,
              frequency: 1,
              lastPrescribed: prescription.visit_date,
              complaintsMatch: matchingComplaints.length,
            });
          }
        });
      }
    });

    // Calculate suggestions with confidence scores
    const suggestions: MedicineSuggestion[] = Array.from(
      medicinePatterns.values()
    )
      .map((pattern) => {
        // Calculate confidence based on frequency, recency, and complaint relevance
        const daysSinceLastPrescribed = Math.floor(
          (Date.now() - new Date(pattern.lastPrescribed).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Higher confidence for more frequent, recent, and relevant prescriptions
        const frequencyScore = Math.min(pattern.frequency / 5, 1); // Max score at 5+ prescriptions
        const recencyScore = Math.max(0, (30 - daysSinceLastPrescribed) / 30); // Higher for recent
        const relevanceScore = Math.min(
          pattern.complaintsMatch / complaints.length,
          1
        );

        const confidence =
          (frequencyScore * 0.4 + recencyScore * 0.3 + relevanceScore * 0.3) *
          100;

        return {
          ...pattern.medicine,
          id: `suggestion-${pattern.medicine.name}-${Date.now()}`,
          confidence: Math.round(confidence),
          frequency: pattern.frequency,
          lastPrescribed: pattern.lastPrescribed,
          availableInInventory: true, // We'll check this later
          relatedComplaints: complaints,
        };
      })
      .sort((a, b) => {
        // Sort by confidence first, then by recency
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return (
          new Date(b.lastPrescribed).getTime() -
          new Date(a.lastPrescribed).getTime()
        );
      })
      .slice(0, 2); // Return only top 2 suggestions

    return suggestions;
  } catch (error) {
    console.error("Error getting medicine suggestions:", error);
    return [];
  }
}

export function calculateMedicineFrequency(
  doctorId: string,
  medicineName: string,
  timeframe: "week" | "month" | "quarter" = "month"
): Promise<number> {
  // This could be expanded for detailed analytics
  return Promise.resolve(0);
}
