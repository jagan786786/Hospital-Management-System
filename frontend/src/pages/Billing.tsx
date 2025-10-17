import BillingTab from "@/components/medical/BillingTab";

export default function Billing() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Billing Management
        </h1>
        <p className="text-muted-foreground">
          Bill medicines and view billing history
        </p>
      </div>
      <BillingTab />
    </div>
  );
}
