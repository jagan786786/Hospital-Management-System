import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the patient list page since that's our main dashboard
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Loading Medical Dashboard...</h1>
        <p className="text-xl text-muted-foreground">Redirecting to patient management...</p>
      </div>
    </div>
  );
};

export default Index;