import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/providers/editor-provider";
import { EditorNodeType, OperatorType } from "@/lib/types";
import { useAutoStore } from "@/store";

const operators: { value: OperatorType; label: string }[] = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
  { value: "NOT", label: "NOT" },
  { value: "EQ", label: "Equals" },
  { value: "NEQ", label: "Not Equals" },
  { value: "GT", label: "Greater Than" },
  { value: "LT", label: "Less Than" },
  { value: "GTE", label: "Greater Than or Equal" },
  { value: "LTE", label: "Less Than or Equal" },
  { value: "ISNULL", label: "Is Null" },
  { value: "ISNOTNULL", label: "Is Not Null" },
  { value: "CONTAINS", label: "Contains" },
  { value: "LENGTH", label: "Length" },
  { value: "STARTSWITH", label: "Starts With" },
  { value: "ENDSWITH", label: "Ends With" },
];

const getNextAvailableNodes = (
  allElements: EditorNodeType[],
  currentNodeIndex: number,
  maxDistance: number = 2
): EditorNodeType[] => {
  return allElements.filter((node) => {
    const nodeIndex = node.data.index;
    const isAfterCurrent = nodeIndex > currentNodeIndex;
    const isWithinRange = nodeIndex < currentNodeIndex + maxDistance + 1;

    return isAfterCurrent && isWithinRange;
  });
};

export const ConditionSelector = () => {
  const { state } = useEditor();
  const { conditionNode, setConditionNode } = useAutoStore();
  const currentNode = state.editor.selectedNode.data.index;
  const nextNodes = getNextAvailableNodes(state.editor.elements, currentNode);

  const handleOperatorChange = (value: OperatorType) => {
    console.log(value);
    setConditionNode({ ...conditionNode, operator: value });
  };

  const handleNextNode = (selectedType: string) => {
    // Get the next node that's not selected as true path
    const falseNode = nextNodes.find((node) => node.type !== selectedType);
    
    // Only update if we found both true and false nodes
    if (falseNode) {
      setConditionNode({
        ...conditionNode,
        trueValue: selectedType,
        falseValue: falseNode.type
      });
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[200px]">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Operator</label>
            <Select
              value={conditionNode.operator}
              onValueChange={handleOperatorChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Operators</SelectLabel>
                  {operators.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full">
            <label className="text-sm font-medium">Parameter</label>
            <Input
              className="w-full"
              placeholder="Parameter"
              value={conditionNode.parameter}
              onChange={(e) =>
                setConditionNode({
                  ...conditionNode,
                  parameter: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-auto pt-4">
        <label className="text-sm font-medium">Select True Path Node</label>
        <Select value={conditionNode.trueValue} onValueChange={handleNextNode}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select node for true condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Next Nodes</SelectLabel>
              {nextNodes.map((node) => (
                <SelectItem key={node.id} value={node.type}>
                  {node.type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ConditionSelector;