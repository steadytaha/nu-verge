import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionProviderProps } from "@/providers/connections-provider";
import { useAutoStore } from "@/store";

type Props = {
  nodeConnection: ConnectionProviderProps;
  onPropertyChange: (property: string, value: any) => void;
};

const NotionPropertiesSelector = ({
  nodeConnection,
  onPropertyChange,
}: Props) => {
  // Create a state to store all properties
  const { notionDetails, setNotionDetails, notionProperties } = useAutoStore();
  const [properties, setProperties] = useState<Record<string, any>>({
    Class: notionDetails.class,
    Type: notionDetails.type,
    Reviewed: notionDetails.reviewed,
  });

  // useEffect(() => {
  //   console.log("Retrieving Notion Page...");
  //   getNotionDatabase(
  //     "152e42a3-dd30-4dd6-9d74-101dff89bc81",
  //     "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"
  //   ).then((response) => {
  //     console.log("Pagesss Retrieved:", response);
  //     console.log("Properties:", notionProperties);
  //   });
  // }, []);
  // Helper function to update properties
  const handlePropertyChange = (property: string, value: any) => {
    const updatedProperties = {
      ...properties,
      [property]: value,
    };
    setProperties(updatedProperties);
    setNotionDetails({
      class: updatedProperties.Class,
      type: updatedProperties.Type,
      reviewed: updatedProperties.Reviewed,
    });
    nodeConnection.setNotionDetails({
      class: updatedProperties.Class,
      type: updatedProperties.Type,
      reviewed: updatedProperties.Reviewed,
    });

    /*console.log('Updated Properties:', {
      class: updatedProperties.Class,
      type: updatedProperties.Type,
      reviewed: updatedProperties.Reviewed
    });*/
    onPropertyChange(property, value);
  };
  useEffect(() => {
    setProperties({
      Class: notionDetails.class,
      Type: notionDetails.type,
      Reviewed: notionDetails.reviewed,
    });
  }, [notionDetails]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Page Properties</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {notionProperties.map((property: any) => {
          if (property.type === "checkbox") {
            return (
              <div key={property.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={properties[property.key]}
                  id={property.key}
                  onCheckedChange={(checked) =>
                    handlePropertyChange(property.key, checked)
                  }
                />
                <Label htmlFor={property.key}>{property.key}</Label>
              </div>
            );
          }

          return (
            <div key={property.key} className="flex flex-col gap-2">
              <Label>{property.key}</Label>
              <Select
                value={properties[property.key]}
                onValueChange={(value) =>
                  handlePropertyChange(property.key, value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`select ${property.key.toLocaleLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {property.options &&
                    property.options.map((option: any) => (
                      <SelectItem key={option.name} value={option.name}>
                        <div
                          className={`bg-${option.color}-500 p-0.5 font-semibold`}
                        >{`${option.name} `}</div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NotionPropertiesSelector;
