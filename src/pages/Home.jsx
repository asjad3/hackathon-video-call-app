import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, ArrowRight } from 'lucide-react';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 mb-4 shadow-lg">
                        <Video className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Video Call</h1>
                    <p className="text-gray-300">Connect with anyone, anywhere.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 ml-1">
                            Room ID
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="roomId"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Enter Room ID"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all hover:-translate-y-0.5 shadow-lg font-medium"
                    >
                        Start Call
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Secure • High Quality • One-on-One</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
