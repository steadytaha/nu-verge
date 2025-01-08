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

export const WaitSelector = () => {
  const { waitNode, setWaitNode } = useAutoStore();

  const options = ["Every", "After"];
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium">Running Type</label>
        <Select
          value={waitNode.jobDetails.type}
          onValueChange={(value) => {
            setWaitNode({
              ...waitNode,
              jobDetails: { ...waitNode.jobDetails, type: value },
            });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a way to run" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 ">
        <label className="text-sm font-medium">Timing </label>
        <div className="flex justify-between gap-1 items-center">
          <Input placeholder="Hours" type="number" value={waitNode.jobDetails.hours} onChange={(e) => setWaitNode({ ...waitNode, jobDetails: { ...waitNode.jobDetails, hours: Number(e.target.value) || 0 } })} />
          :
          <Input placeholder="Minutes" type="number" value={waitNode.jobDetails.minutes} onChange={(e) => setWaitNode({ ...waitNode, jobDetails: { ...waitNode.jobDetails, minutes: Number(e.target.value) || 0 } })} />
          :
          <Input placeholder="Seconds" type="number" value={waitNode.jobDetails.seconds} onChange={(e) => setWaitNode({ ...waitNode, jobDetails: { ...waitNode.jobDetails, seconds: Number(e.target.value) || 0 } })} />
        </div>
      </div>
    </div>
  );
};
