/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import { useState, ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ConfirmationPopover = ({
  renderElement,
  prompt,
  remove,
}: {
  renderElement: () => ReactNode;
  prompt: string;
  remove: (id?: any, note?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>{renderElement()}</PopoverTrigger>
      <PopoverContent>
        <p className="text-lg font-semibold mb-2">{prompt}</p>
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              remove();
              setIsOpen(false);
            }}
          >
            Remove
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfirmationPopover;
