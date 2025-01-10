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
import { useAutoStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface WaitSelectorProps {
  onExecute: () => void;
}

export const WaitSelector: React.FC<WaitSelectorProps> = ({ onExecute }) => {
  const { waitNode, setWaitNode } = useAutoStore();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [displayIntervalId, setDisplayIntervalId] = useState<NodeJS.Timeout | null>(null);

  const validateTiming = () => {
    const { hours, minutes, seconds } = waitNode.jobDetails;
    if (hours === 0 && minutes === 0 && seconds === 0) {
      toast({
        variant: "destructive",
        title: "Invalid timing",
        description: "Please set a time greater than 0",
      });
      return false;
    }
    return true;
  };

  const getMilliseconds = (): number => {
    const { hours, minutes, seconds } = waitNode.jobDetails;
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
    setTimeLeft('')
    setTimerId(null)
    setIntervalId(null)
    setDisplayIntervalId(null)

    const timeInMs = getMilliseconds();
    const endTime = Date.now() + timeInMs;

    stopTimer();

    if (waitNode.jobDetails.type === "After") {
      const newTimerId = setTimeout(() => {
        onExecute();
        stopTimer();
      }, timeInMs);
      setTimerId(newTimerId);
    } else {
      onExecute();
      const newIntervalId = setInterval(onExecute, timeInMs);
      setIntervalId(newIntervalId);
    }

    const newDisplayIntervalId = setInterval(() => {
      const now = Date.now();
      if (waitNode.jobDetails.type === "After" && now >= endTime) {
        setTimeLeft('');
        clearInterval(newDisplayIntervalId);
      } else {
        const remaining = waitNode.jobDetails.type === "After"
          ? endTime - now
          : timeInMs - (now % timeInMs);
        setTimeLeft(formatTimeLeft(remaining));
      }
    }, 1000);

    setDisplayIntervalId(newDisplayIntervalId);
    setIsRunning(true);
  };

  const stopTimer = () => {
    [timerId, intervalId, displayIntervalId].forEach(id => id && clearInterval(id));
    setTimerId(null);
    setIntervalId(null); 
    setDisplayIntervalId(null);
    setTimeLeft('');
    setIsRunning(false);
  };

  const handleInputChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = Math.max(0, Math.min(field === 'hours' ? 23 : 59, parseInt(value) || 0));
    setWaitNode({
      ...waitNode,
      jobDetails: {
        ...waitNode.jobDetails,
        [field]: numValue
      }
    });
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium">Execution Type</label>
        <Select
          value={waitNode.jobDetails.type}
          onValueChange={(value) => {
            setWaitNode({
              ...waitNode,
              jobDetails: { ...waitNode.jobDetails, type: value },
            });
          }}
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

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Duration</label>
        <div className="flex justify-between gap-1 items-center">
          <Input 
            placeholder="Hours" 
            type="number"
            min="0"
            max="24"
            value={waitNode.jobDetails.hours} 
            onChange={(e) => handleInputChange('hours', e.target.value)}
            disabled={isRunning}
            className="w-full"
          />
          :
          <Input 
            placeholder="Minutes" 
            type="number"
            min="0"
            max="59"
            value={waitNode.jobDetails.minutes} 
            onChange={(e) => handleInputChange('minutes', e.target.value)}
            disabled={isRunning}
            className="w-full"
          />
          :
          <Input 
            placeholder="Seconds" 
            type="number"
            min="0"
            max="59"
            value={waitNode.jobDetails.seconds} 
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
