import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, ArrowRight, Sparkles, Copy, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [recentMeetings, setRecentMeetings] = useState([]);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const stored = localStorage.getItem('recentMeetings');
        if (stored) {
            setRecentMeetings(JSON.parse(stored));
        }
    }, []);

    const addToRecent = (id) => {
        const newMeeting = { id, date: new Date().toISOString() };
        const updated = [newMeeting, ...recentMeetings.filter(m => m.id !== id)].slice(0, 5);
        setRecentMeetings(updated);
        localStorage.setItem('recentMeetings', JSON.stringify(updated));
    };

    const clearRecent = () => {
        setRecentMeetings([]);
        localStorage.removeItem('recentMeetings');
        toast({ title: "History Cleared", description: "Recent meetings have been cleared." });
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            addToRecent(roomId);
            navigate(`/room/${roomId}`);
        }
    };

    const handleCreateMeeting = () => {
        const randomId = Math.random().toString(36).substring(2, 9);
        addToRecent(randomId);
        navigate(`/room/${randomId}`);
        toast({ title: "Meeting Created", description: "Entering your new meeting room...", type: "success" });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Room ID copied to clipboard.", type: "success" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background selection:bg-primary/30">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-float-delayed" />
                <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <Card className="glass-card border-white/10 shadow-2xl animate-fade-in">
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-2 ring-1 ring-white/10 shadow-inner">
                            <Video className="w-10 h-10 text-primary drop-shadow-lg" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-4xl font-bold tracking-tight">
                                Video<span className="text-gradient">Call</span>
                            </CardTitle>
                            <CardDescription className="text-lg font-medium text-muted-foreground/80">
                                Premium secure meetings for everyone.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-6">
                        <div className="space-y-4">
                            <Button
                                onClick={handleCreateMeeting}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-primary/25 rounded-xl group"
                                size="lg"
                            >
                                <Sparkles className="mr-2 w-5 h-5 group-hover:animate-spin-slow" />
                                New Meeting
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                    <span className="glass px-4 py-1 rounded-full text-muted-foreground font-medium">
                                        Or join with code
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleJoin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomId" className="sr-only">Room ID</Label>
                                    <div className="relative group">
                                        <Users className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="roomId"
                                            placeholder="Enter Room ID"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            className="pl-12 h-14 text-lg bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full h-14 text-lg font-semibold bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all rounded-xl"
                                    size="lg"
                                >
                                    Join Meeting
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-center border-t border-white/5 pt-6 pb-6">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground/60">
                            <Sparkles className="w-4 h-4 text-yellow-500/50" />
                            <span>Secure • HD Quality • Unlimited</span>
                        </div>
                    </CardFooter>
                </Card>

                {/* Recent Meetings Section */}
                {recentMeetings.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Recent Meetings
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearRecent}
                                className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Clear
                            </Button>
                        </div>
                        <div className="grid gap-3">
                            {recentMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-card/30 border border-white/5 hover:bg-card/50 hover:border-primary/20 transition-all cursor-pointer"
                                    onClick={() => {
                                        setRoomId(meeting.id);
                                        toast({ title: "Room ID Selected", description: "Click Join to enter." });
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Video className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{meeting.id}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(meeting.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(meeting.id);
                                        }}
                                    >
                                        <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
