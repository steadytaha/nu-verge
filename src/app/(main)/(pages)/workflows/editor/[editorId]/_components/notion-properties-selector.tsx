import React, { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  nodeConnection: any;
  onPropertyChange: (property: string, value: any) => void;
}


const NotionPropertiesSelector = ({ nodeConnection, onPropertyChange }: Props) => {
  // Create a state to store all properties
  const [properties, setProperties] = useState({
    Class: '',
    Type: '',
    Reviewed: false
  });

  // Helper function to update properties
  const handlePropertyChange = (property: string, value: any) => {
    const updatedProperties = {
      ...properties,
      [property]: value
    };
    setProperties(updatedProperties);
    console.log('Updated Properties:', updatedProperties);
    onPropertyChange(property, value);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Page Properties</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select onValueChange={(value) => handlePropertyChange('Class', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ESOF 204">ESOF 204</SelectItem>
              <SelectItem value="ESOF 202">ESOF 202</SelectItem>
              <SelectItem value="ESOF 206">ESOF 206</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select onValueChange={(value) => handlePropertyChange('Type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lecture">Lecture</SelectItem>
              <SelectItem value="Section">Section</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Study Group">Study Group</SelectItem>
              <SelectItem value="Reading">Reading</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="reviewed"
            onCheckedChange={(checked) => handlePropertyChange('Reviewed', checked)}
          />
          <Label htmlFor="reviewed">Reviewed</Label>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotionPropertiesSelector 