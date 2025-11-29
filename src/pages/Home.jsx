import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/room/${roomId}`);
        }
    };

    const handleCreateMeeting = () => {
        const randomId = Math.random().toString(36).substring(2, 9);
        navigate(`/room/${randomId}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <Video className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Video<span className="text-primary">Call</span>
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Premium secure meetings for everyone.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Button
                            onClick={handleCreateMeeting}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                            size="lg"
                        >
                            <Sparkles className="mr-2 w-5 h-5" />
                            New Meeting
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or join with code
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomId" className="sr-only">
                                Room ID
                            </Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="roomId"
                                    placeholder="Enter Room ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="pl-10 h-12 text-lg bg-background/50"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full h-12 text-lg font-semibold hover:bg-secondary/80"
                            size="lg"
                        >
                            Join Meeting
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center border-t border-border/50 pt-6 mt-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-yellow-500/50" />
                        <span>Secure • HD Quality • Unlimited</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Home;
