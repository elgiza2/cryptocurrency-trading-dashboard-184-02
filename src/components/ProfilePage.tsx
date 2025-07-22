import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Trophy, 
  TrendingUp, 
  Users, 
  Settings, 
  Share2,
  Crown,
  Medal,
  Star
} from "lucide-react";

const ProfilePage = () => {
  const userStats = {
    rank: 47,
    totalMined: 2384,
    referrals: 12,
    level: 5,
    xp: 1250,
    nextLevelXP: 1500
  };

  const achievements = [
    {
      id: 1,
      title: "First Mine",
      description: "Complete your first mining session",
      icon: Medal,
      earned: true
    },
    {
      id: 2,
      title: "Social Butterfly",
      description: "Invite 10 friends",
      icon: Users,
      earned: true
    },
    {
      id: 3,
      title: "Mining Master",
      description: "Mine for 30 consecutive days",
      icon: Crown,
      earned: false
    },
    {
      id: 4,
      title: "Top Trader",
      description: "Make 100 successful trades",
      icon: TrendingUp,
      earned: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: "CryptoKing", mined: 15420, avatar: "👑" },
    { rank: 2, name: "MinerPro", mined: 12850, avatar: "🥈" },
    { rank: 3, name: "TokenHunter", mined: 11200, avatar: "🥉" },
    { rank: 47, name: "You", mined: 2384, avatar: "🔥", isUser: true }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card p-6 text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 glow-primary">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Mining Master</h1>
        <Badge variant="secondary" className="mb-4">
          Level {userStats.level}
        </Badge>
        
        {/* XP Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{userStats.xp} XP</span>
            <span>{userStats.nextLevelXP} XP</span>
          </div>
          <div className="progress-mining">
            <div 
              className="progress-mining-fill"
              style={{ width: `${(userStats.xp / userStats.nextLevelXP) * 100}%` }}
            />
          </div>
        </div>

        <Button className="btn-mining">
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card p-4 text-center">
          <Trophy className="h-8 w-8 text-secondary mx-auto mb-2" />
          <div className="text-xl font-bold">#{userStats.rank}</div>
          <div className="text-xs text-muted-foreground">Global Rank</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-xl font-bold">{userStats.totalMined.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Mined</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <Users className="h-8 w-8 text-accent mx-auto mb-2" />
          <div className="text-xl font-bold">{userStats.referrals}</div>
          <div className="text-xs text-muted-foreground">Referrals</div>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <Star className="h-8 w-8 text-warning mx-auto mb-2" />
          <div className="text-xl font-bold">{userStats.level}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Achievements</h2>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`glass-card p-4 text-center transition-all duration-300 ${
                achievement.earned 
                  ? 'border-primary/20 bg-primary/5' 
                  : 'opacity-50'
              }`}
            >
              <achievement.icon className={`h-8 w-8 mx-auto mb-2 ${
                achievement.earned ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              {achievement.earned && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Earned
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <Card className="glass-card p-4">
          <div className="space-y-3">
            {leaderboard.map((player) => (
              <div 
                key={player.rank}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                  player.isUser 
                    ? 'bg-primary/10 border border-primary/20 glow-primary' 
                    : 'bg-card/30'
                }`}
              >
                <div className="text-2xl">{player.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${
                        player.isUser ? 'text-primary' : ''
                      }`}>
                        {player.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        #{player.rank}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {player.mined.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        VIREON
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Settings */}
      <Card className="glass-card p-4">
        <Button variant="outline" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings & Preferences
        </Button>
      </Card>
    </div>
  );
};

export default ProfilePage;