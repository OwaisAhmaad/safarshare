import { useState } from 'react';
import { Car, Bike, Bus, Truck, Zap, Users, ShieldCheck, Star, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

const VEHICLE_TYPES = [
  { id: 'bike', name: 'BIKE', icon: <Bike size={32} /> },
  { id: 'car', name: 'SEDAN / CAR', icon: <Car size={32} /> },
  { id: 'hiace', name: 'HIACE', icon: <Bus size={32} /> },
  { id: 'suzuki_carry', name: 'SUZUKI CARRY', icon: <Truck size={32} /> },
  { id: 'coaster', name: 'COASTER', icon: <Bus size={32} /> },
  { id: 'flying_coach', name: 'FLYING COACH', icon: <Zap size={32} /> },
];

export default function App() {
  const [selectedVehicle, setSelectedVehicle] = useState('car');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white px-8 md:px-16 py-5 flex justify-between items-center border-b-2 border-gray-100 sticky top-0 z-50">
        <div className="text-2xl font-black text-primary tracking-tighter">SafarShare</div>
        <nav className="hidden md:flex gap-8">
          <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">Find a Ride</a>
          <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">Offer a Ride</a>
          <a href="#" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">My Trips</a>
          <a href="#" className="text-sm font-bold uppercase tracking-wider text-primary">Sign In</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Search Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[24px] shadow-xl shadow-black/5 border border-gray-50"
        >
          <span className="inline-block px-3 py-1 bg-accent text-dark text-[10px] font-extrabold uppercase rounded-md mb-6">
            Trusted by 50k+ Users
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-8 text-dark">
            Your Journey, <br />Shared Better.
          </h1>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Pick-up point</label>
              <input 
                type="text" 
                className="w-full p-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Blue Area, Islamabad"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400">Destination</label>
              <input 
                type="text" 
                className="w-full p-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Gulberg III, Lahore"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400">Date</label>
                <input 
                  type="text" 
                  className="w-full p-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-primary focus:outline-none transition-all"
                  defaultValue="Oct 24, 2023"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400">Passengers</label>
                <input 
                  type="text" 
                  className="w-full p-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-primary focus:outline-none transition-all"
                  defaultValue="1 Person"
                />
              </div>
            </div>

            <button className="w-full py-5 bg-primary text-white rounded-xl text-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 mt-4">
              Find Rides
            </button>
          </div>
        </motion.div>

        {/* Vehicle Selection */}
        <div className="space-y-10">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Select Vehicle Category</h3>
            <div className="grid grid-cols-3 gap-4">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`p-6 rounded-[20px] flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                    selectedVehicle === v.id 
                      ? 'bg-secondary/10 border-secondary text-secondary shadow-lg shadow-secondary/10' 
                      : 'bg-white border-transparent text-dark hover:border-gray-200'
                  }`}
                >
                  <span className={selectedVehicle === v.id ? 'text-secondary' : 'text-gray-400'}>
                    {v.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{v.name}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary p-8 rounded-[24px] text-white shadow-xl shadow-secondary/20"
          >
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Safety First Guarantee</h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  All SafarShare drivers are verified with CNIC, Driving License, and Biometric checks. 
                  Travel with peace of mind across all vehicle types.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Stats Bar */}
      <footer className="bg-dark text-white py-10 px-8 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <span className="block text-3xl font-black">12.5k</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">Trips Completed</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-3xl font-black">8.2k</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">Verified Drivers</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-3xl font-black">4.9/5</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">Average Rating</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-3xl font-black">PKR 2.4M</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">User Savings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
