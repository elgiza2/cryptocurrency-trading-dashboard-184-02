import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === "admin123") {
      onLogin();
      toast({ title: "Welcome Admin!" });
    } else {
      toast({ 
        title: "Invalid Password", 
        description: "Please enter the correct admin password",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-muted/10 border-white/10 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-muted-foreground">Enter admin password to continue</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="bg-muted/20 border-white/10 text-white"
          />
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Access Admin Panel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;