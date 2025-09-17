import LoginForm from "@/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SecureLogin</h1>
          <p className="text-gray-500">Professional access portal</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
