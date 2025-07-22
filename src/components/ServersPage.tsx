import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Server, Zap } from "lucide-react";
import ServerPage from "./ServerPage";

interface ServersPageProps {
  onBack?: () => void;
}

const ServersPage = ({ onBack }: ServersPageProps) => {
  return (
    <div className="p-4 space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
      )}
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Server className="h-5 w-5" />
            خوادم التعدين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            استأجر خوادم التعدين لزيادة أرباحك اليومية
          </p>
        </CardContent>
      </Card>

      <ServerPage />
    </div>
  );
};

export default ServersPage;