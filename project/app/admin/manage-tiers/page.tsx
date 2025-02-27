"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { createBrowserClient } from "@supabase/ssr";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Crown, Users, History, ArrowRight } from "lucide-react";

interface User {
  id: string;
  email: string;
  currentTier: string;
}

interface TierHistory {
  tier: string;
  start_date: string;
  end_date: string | null;
  duration_days: number;
  is_current: boolean;
  change_reason: string;
}

export default function ManageTiersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [changeReason, setChangeReason] = useState<string>("");
  const [tierHistory, setTierHistory] = useState<TierHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  
  const { toast } = useToast();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users with their current tier
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          user_id,
          tier,
          profiles:user_id (
            email
          )
        `);
      
      if (error) {
        throw error;
      }
      
      const formattedUsers = data.map((item: any) => ({
        id: item.user_id,
        email: item.profiles?.email || 'Unknown',
        currentTier: item.tier
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTierHistory = async (userId: string) => {
    try {
      setLoadingHistory(true);
      
      const { data, error } = await supabase
        .rpc('get_user_tier_history', {
          p_user_id: userId
        });
      
      if (error) {
        throw error;
      }
      
      setTierHistory(data || []);
    } catch (error) {
      console.error('Error fetching tier history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tier history",
        variant: "error"
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedTier(user.currentTier);
    fetchTierHistory(user.id);
  };

  const handleUpdateTier = async () => {
    if (!selectedUser || !selectedTier) return;
    
    try {
      setUpdating(true);
      
      const response = await fetch('/api/update-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          reason: changeReason || 'admin_update'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tier');
      }
      
      toast({
        title: "Success",
        description: `Updated ${selectedUser.email} to ${selectedTier} tier`,
        variant: "success"
      });
      
      // Refresh user list and tier history
      fetchUsers();
      if (selectedUser) {
        fetchTierHistory(selectedUser.id);
      }
      
      // Update the selected user's tier in the UI
      setSelectedUser({
        ...selectedUser,
        currentTier: selectedTier
      });
      
      setChangeReason("");
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tier",
        variant: "error"
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'text-gray-600 bg-gray-100';
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'pro':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full theme-header">
        <div className="flex h-14 items-center px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Manage User Tiers</h1>
              <p className="text-muted-foreground">View and update subscription tiers for users</p>
            </div>
            <Button 
              onClick={fetchUsers}
              variant="outline"
              className="border-purple-500/20 hover:border-purple-500/40"
            >
              Refresh Users
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* User List */}
            <Card className="p-6 col-span-1 bg-white/80 backdrop-blur-sm border-border/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Users</h2>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{users.length} total</span>
                  </div>
                </div>
                
                <div>
                  <Input
                    placeholder="Search users by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                  />
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id
                              ? 'bg-purple-500/10 border border-purple-500/20'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="truncate flex-1">
                              <div className="font-medium truncate">{user.email}</div>
                              <div className="text-xs text-muted-foreground truncate">ID: {user.id}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(user.currentTier)}`}>
                              {user.currentTier}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* User Details and Tier Management */}
            <Card className="p-6 col-span-2 bg-white/80 backdrop-blur-sm border-border/40">
              {selectedUser ? (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-border/40">
                    <h2 className="text-xl font-semibold mb-2">{selectedUser.email}</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">ID: {selectedUser.id}</div>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(selectedUser.currentTier)}`}>
                        Current Tier: {selectedUser.currentTier}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Update Subscription Tier</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tier">Select Tier</Label>
                        <Select
                          value={selectedTier}
                          onValueChange={setSelectedTier}
                        >
                          <SelectTrigger id="tier">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Change Reason (Optional)</Label>
                        <Input
                          id="reason"
                          placeholder="e.g., promotion, customer request"
                          value={changeReason}
                          onChange={(e) => setChangeReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleUpdateTier}
                      disabled={updating || selectedTier === selectedUser.currentTier}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Update Tier
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Tier History</h3>
                      <div className="flex items-center space-x-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{tierHistory.length} changes</span>
                      </div>
                    </div>
                    
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : tierHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No tier history found
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {tierHistory.map((history, index) => (
                          <div 
                            key={index}
                            className="p-4 rounded-lg border border-border/40 bg-white/50"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(history.tier)}`}>
                                    {history.tier}
                                  </div>
                                  {history.is_current && (
                                    <div className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-600">
                                      Current
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm mt-1">
                                  Reason: <span className="font-medium">{history.change_reason || 'Not specified'}</span>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div>
                                  <span className="text-muted-foreground">From:</span> {new Date(history.start_date).toLocaleDateString()}
                                </div>
                                {history.end_date && (
                                  <div>
                                    <span className="text-muted-foreground">To:</span> {new Date(history.end_date).toLocaleDateString()}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {history.duration_days} days
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Select a User</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    Select a user from the list to view and manage their subscription tier
                  </p>
                  <ArrowRight className="h-6 w-6 text-muted-foreground mt-4 transform -rotate-90" />
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 