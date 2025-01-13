import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface WaitSelectorProps {
  onExecute: () => void;
}

export const WaitSelector: React.FC<WaitSelectorProps> = ({ onExecute }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [timers, setTimers] = useState<NodeJS.Timeout[]>([]);
  const [type, setType] = useState<'After' | 'Every'>('After');
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const validateTiming = () => {
    const { hours, minutes, seconds } = time;
    return !(hours === 0 && minutes === 0 && seconds === 0);
  };

  const getMilliseconds = (): number => {
    const { hours, minutes, seconds } = time;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const formatTimeLeft = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!validateTiming()) return;

    // Clear any existing timers and state
    stopTimer();
    
    const timeInMs = getMilliseconds();
    const startTime = Date.now();
    const endTime = startTime + timeInMs;
    const newTimers: NodeJS.Timeout[] = [];
    
    if (type === "After") {
      // Set initial time left
      setTimeLeft(formatTimeLeft(timeInMs));
      
      // For "After" type, set a single timeout and update display
      const displayTimer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          onExecute();
          stopTimer();
        } else {
          setTimeLeft(formatTimeLeft(remaining));
        }
      }, 1000);
      
      newTimers.push(displayTimer);
    } else {
      // For "Every" type
      // Set initial time left
      setTimeLeft(formatTimeLeft(timeInMs));
      
      onExecute(); // Execute immediately

      // Set up the execution interval
      const executeTimer = setInterval(() => {
        onExecute();
      }, timeInMs);

      // Set up the display update interval
      const displayTimer = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) % timeInMs;
        const remaining = timeInMs - elapsed;
        setTimeLeft(formatTimeLeft(remaining));
      }, 1000);

      newTimers.push(executeTimer, displayTimer);
    }
    
    setTimers(newTimers);
    setIsRunning(true);
  };

  const stopTimer = () => {
    timers.forEach(timer => clearInterval(timer));
    setTimers([]);
    setTimeLeft('');
    setIsRunning(false);
  };

  const handleInputChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = Math.max(0, Math.min(field === 'hours' ? 23 : 59, parseInt(value) || 0));
    setTime(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  useEffect(() => {
    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [timers]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium">Execution Type</label>
        <Select
          value={type}
          onValueChange={(value: 'After' | 'Every') => setType(value)}
          disabled={isRunning}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select execution type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="After">After</SelectItem>
              <SelectItem value="Every">Every</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between gap-1 items-center">
          <div className="flex flex-col w-full">
            <label htmlFor="hours" className="text-xs text-muted-foreground mb-1">Hours</label>
            <Input 
              id="hours"
              placeholder="Hours" 
              type="number"
              min="0"
              max="24"
              value={time.hours} 
              onChange={(e) => handleInputChange('hours', e.target.value)}
              disabled={isRunning}
              className="w-full"
            />
          </div>
          :
          <div className="flex flex-col w-full">
            <label htmlFor="minutes" className="text-xs text-muted-foreground mb-1">Minutes</label>
            <Input 
              id="minutes"
              placeholder="Minutes" 
              type="number"
              min="0"
              max="59"
              value={time.minutes} 
              onChange={(e) => handleInputChange('minutes', e.target.value)}
              disabled={isRunning}
              className="w-full"
            />
          </div>
          :
          <div className="flex flex-col w-full">
            <label htmlFor="seconds" className="text-xs text-muted-foreground mb-1">Seconds</label>
            <Input 
              id="seconds"
              placeholder="Seconds" 
              type="number"
              min="0"
              max="59"
              value={time.seconds} 
              onChange={(e) => handleInputChange('seconds', e.target.value)}
              disabled={isRunning}
              className="w-full"
            />
          </div>
        </div>

      {timeLeft && (
        <div className="text-sm text-muted-foreground text-center">
          Time remaining: {timeLeft}
        </div>
      )}

      <Button
        onClick={isRunning ? stopTimer : startTimer}
        className="w-full"
        variant={isRunning ? "destructive" : "default"}
      >
        {isRunning ? (
          <>
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start
          </>
        )}
      </Button>
    </div>
  );
};

export default WaitSelector;