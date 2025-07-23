import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<"missions" | "tokens" | "users">("missions");
  const [missions, setMissions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  const [missionForm, setMissionForm] = useState({
    title: "",
    mission_type: "",
    reward_amount: "",
    reward_cryptocurrency_id: "",
    url: "",
    language: ""
  });

  const [tokenForm, setTokenForm] = useState({
    name: "",
    symbol: "",
    current_price: "",
    icon_url: ""
  });

  useEffect(() => {
    loadMissions();
    loadTokens();
    loadUsers();
  }, []);

  const loadMissions = async () => {
    try {
      // Get VIREON cryptocurrency ID
      const { data: vireonData } = await supabase
        .from('cryptocurrencies')
        .select('id')
        .eq('symbol', 'VIREON')
        .single();

      const { data, error } = await supabase
        .from('missions')
        .select('*, cryptocurrencies(name, symbol)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  };

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Generate user statistics by country
      const totalUsers = data?.length || 0;
      const russianUsers = Math.floor(Math.random() * (150000 - 140000 + 1)) + 140000;
      const usUsers = Math.floor(totalUsers * 0.15);
      const ukUsers = Math.floor(totalUsers * 0.08);
      const deUsers = Math.floor(totalUsers * 0.06);
      const otherUsers = Math.max(0, totalUsers - russianUsers - usUsers - ukUsers - deUsers);
      
      const userStats = [
        { country: "Russia", users: russianUsers, flag: "🇷🇺" },
        { country: "United States", users: usUsers, flag: "🇺🇸" },
        { country: "Ukraine", users: ukUsers, flag: "🇺🇦" },
        { country: "Germany", users: deUsers, flag: "🇩🇪" },
        { country: "Others", users: otherUsers, flag: "🌍" }
      ];
      
      setUsers(userStats);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSaveMission = async () => {
    try {
      // Get VIREON cryptocurrency ID
      const { data: vireonData } = await supabase
        .from('cryptocurrencies')
        .select('id')
        .eq('symbol', 'VIREON')
        .single();

      if (!vireonData) {
        toast({ title: "VIREON currency not found", variant: "destructive" });
        return;
      }

      const missionData = {
        title: missionForm.title,
        mission_type: missionForm.mission_type,
        reward_amount: parseFloat(missionForm.reward_amount),
        reward_cryptocurrency_id: vireonData.id,
        url: missionForm.url,
        description: `${missionForm.title} - ${missionForm.language}` // Include language in description
      };

      if (editingItem) {
        const { error } = await supabase
          .from('missions')
          .update(missionData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Mission updated successfully" });
      } else {
        const { error } = await supabase
          .from('missions')
          .insert(missionData);
        if (error) throw error;
        toast({ title: "Mission created successfully" });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setMissionForm({ title: "", mission_type: "", reward_amount: "", reward_cryptocurrency_id: "", url: "", language: "" });
      loadMissions();
    } catch (error) {
      console.error('Error saving mission:', error);
      toast({ title: "Error saving mission", variant: "destructive" });
    }
  };

  const handleSaveToken = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('cryptocurrencies')
          .update({
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            current_price: parseFloat(tokenForm.current_price),
            icon_url: tokenForm.icon_url
          })
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Token updated successfully" });
      } else {
        const { error } = await supabase
          .from('cryptocurrencies')
          .insert({
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            current_price: parseFloat(tokenForm.current_price),
            icon_url: tokenForm.icon_url
          });
        if (error) throw error;
        toast({ title: "Token created successfully" });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setTokenForm({ name: "", symbol: "", current_price: "", icon_url: "" });
      loadTokens();
    } catch (error) {
      console.error('Error saving token:', error);
      toast({ title: "Error saving token", variant: "destructive" });
    }
  };

  const handleDeleteMission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Mission deleted successfully" });
      loadMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast({ title: "Error deleting mission", variant: "destructive" });
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cryptocurrencies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Token deleted successfully" });
      loadTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({ title: "Error deleting token", variant: "destructive" });
    }
  };

  const handlePriceChange = async (tokenId: string, increase: boolean) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      if (!token) return;

      const changeAmount = increase ? 0.001 : -0.001;
      const newPrice = Math.max(0.001, (token.current_price || 0) + changeAmount);

      const { error } = await supabase
        .from('cryptocurrencies')
        .update({ current_price: newPrice })
        .eq('id', tokenId);

      if (error) throw error;
      toast({ title: `Price ${increase ? 'increased' : 'decreased'} successfully` });
      loadTokens();
    } catch (error) {
      console.error('Error updating price:', error);
      toast({ title: "Error updating price", variant: "destructive" });
    }
  };

  const openMissionDialog = (mission: any = null) => {
    setEditingItem(mission);
    if (mission) {
      setMissionForm({
        title: mission.title,
        mission_type: mission.mission_type,
        reward_amount: mission.reward_amount.toString(),
        reward_cryptocurrency_id: mission.reward_cryptocurrency_id,
        url: mission.url || "",
        language: mission.description?.split(' - ')[1] || ""
      });
    } else {
      setMissionForm({ title: "", mission_type: "", reward_amount: "", reward_cryptocurrency_id: "", url: "", language: "" });
    }
    setIsDialogOpen(true);
  };

  const openTokenDialog = (token: any = null) => {
    setEditingItem(token);
    if (token) {
      setTokenForm({
        name: token.name,
        symbol: token.symbol,
        current_price: token.current_price?.toString() || "",
        icon_url: token.icon_url || ""
      });
    } else {
      setTokenForm({ name: "", symbol: "", current_price: "", icon_url: "" });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 bg-muted/20 rounded-2xl p-1 mb-6">
          <Button
            className={activeTab === "missions" ? "bg-yellow-500 text-black font-medium" : "text-muted-foreground font-medium"}
            variant={activeTab === "missions" ? "default" : "ghost"}
            onClick={() => setActiveTab("missions")}
          >
            Missions
          </Button>
          <Button
            className={activeTab === "tokens" ? "bg-yellow-500 text-black font-medium" : "text-muted-foreground font-medium"}
            variant={activeTab === "tokens" ? "default" : "ghost"}
            onClick={() => setActiveTab("tokens")}
          >
            Tokens
          </Button>
          <Button
            className={activeTab === "users" ? "bg-yellow-500 text-black font-medium" : "text-muted-foreground font-medium"}
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Button>
        </div>

        {/* Add Button - Only for missions and tokens */}
        {activeTab !== "users" && (
          <Button
            onClick={() => activeTab === "missions" ? openMissionDialog() : openTokenDialog()}
            className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === "missions" ? "Mission" : "Token"}
          </Button>
        )}

        {/* Missions Tab */}
        {activeTab === "missions" && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {missions.map((mission) => (
                <Card key={mission.id} className="bg-muted/10 border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{mission.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Type: {mission.mission_type}</span>
                        <span>Reward: {mission.reward_amount} {mission.cryptocurrencies?.symbol}</span>
                        {mission.url && <span>URL: {mission.url}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openMissionDialog(mission)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteMission(mission.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {tokens.map((token) => (
                <Card key={token.id} className="bg-muted/10 border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        {token.icon_url ? (
                          <img src={token.icon_url} alt={token.symbol} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-yellow-500">{token.symbol?.slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{token.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{token.symbol}</span>
                          <span>${token.current_price?.toFixed(4) || "0.0000"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handlePriceChange(token.id, false)}>
                        <TrendingDown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handlePriceChange(token.id, true)}>
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openTokenDialog(token)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteToken(token.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Users by Country</h3>
                <div className="bg-muted/10 border-white/10 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-white mb-2">
                    {users.reduce((total, country) => total + country.users, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Active Users</div>
                </div>
              </div>
              
              {users.map((country, index) => (
                <Card key={index} className="bg-muted/10 border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <h3 className="font-semibold text-white">{country.country}</h3>
                        <div className="text-sm text-muted-foreground">
                          {((country.users / users.reduce((total, c) => total + c.users, 0)) * 100).toFixed(1)}% of total users
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {country.users.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {activeTab === "missions" ? "Mission" : "Token"}
            </DialogTitle>
          </DialogHeader>
          
          {activeTab === "missions" ? (
            <div className="space-y-4">
              <Input
                placeholder="Mission Title"
                value={missionForm.title}
                onChange={(e) => setMissionForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Select value={missionForm.mission_type} onValueChange={(value) => setMissionForm(prev => ({ ...prev, mission_type: value }))}>
                <SelectTrigger className="bg-muted/20 border-white/10 text-white">
                  <SelectValue placeholder="Select mission type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="main" className="text-white">Main Tasks</SelectItem>
                  <SelectItem value="social" className="text-white">Social Tasks</SelectItem>
                  <SelectItem value="daily" className="text-white">Daily Tasks</SelectItem>
                  <SelectItem value="partners" className="text-white">Partner Tasks</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Reward Amount"
                type="number"
                value={missionForm.reward_amount}
                onChange={(e) => setMissionForm(prev => ({ ...prev, reward_amount: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Input
                placeholder="Mission URL (optional)"
                value={missionForm.url}
                onChange={(e) => setMissionForm(prev => ({ ...prev, url: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Select value={missionForm.language} onValueChange={(value) => setMissionForm(prev => ({ ...prev, language: value }))}>
                <SelectTrigger className="bg-muted/20 border-white/10 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="English" className="text-white">🇺🇸 English</SelectItem>
                  <SelectItem value="Russian" className="text-white">🇷🇺 Russian</SelectItem>
                  <SelectItem value="Arabic" className="text-white">🇸🇦 Arabic</SelectItem>
                  <SelectItem value="Hindi" className="text-white">🇮🇳 Hindi</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                Reward will be automatically set to VIREON
              </div>
              <Button onClick={handleSaveMission} className="w-full bg-yellow-500 text-black font-medium">
                {editingItem ? "Update" : "Create"} Mission
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Token Name"
                value={tokenForm.name}
                onChange={(e) => setTokenForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Input
                placeholder="Token Symbol"
                value={tokenForm.symbol}
                onChange={(e) => setTokenForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Input
                placeholder="Current Price"
                type="number"
                step="0.0001"
                value={tokenForm.current_price}
                onChange={(e) => setTokenForm(prev => ({ ...prev, current_price: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Input
                placeholder="Icon URL"
                value={tokenForm.icon_url}
                onChange={(e) => setTokenForm(prev => ({ ...prev, icon_url: e.target.value }))}
                className="bg-muted/20 border-white/10 text-white"
              />
              <Button onClick={handleSaveToken} className="w-full bg-yellow-500 text-black font-medium">
                {editingItem ? "Update" : "Create"} Token
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;