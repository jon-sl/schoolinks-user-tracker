/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import _ from "lodash";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import { CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

const DeleteNotePopover = ({
  note,
  user,
  removeNote,
}: {
  note: string;
  user: any;
  removeNote: (id: any, note: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Badge>{note}</Badge>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-lg font-semibold mb-2">Remove note?</p>
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              removeNote(user["field-id"], note);
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

const RemoveUserPopover = ({ removeUser }: { removeUser: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button variant="destructive" size="sm">
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-lg font-semibold mb-2">Remove user?</p>
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              removeUser();
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

function Row({ env, user, setCurrent, getSyncData }: any) {
  const id = user["field-id"];
  const [notes, setNotes] = useState("");

  const handleKeyDown = async (e: any) => {
    if (e.key === "Enter") {
      const previousData: any = await getSyncData();
      const updatedData = {
        ...previousData[env][id],
        notes: [...(previousData[env][id].notes || []), ...notes.split(",")],
      };
      chrome.storage.sync.set(
        { [env]: { ...previousData[env], [id]: updatedData } },
        function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            setCurrent({ ...previousData[env], [id]: updatedData });
            setNotes("");
          }
        }
      );
    }
  };

  const removeNote = async (id: any, note: string) => {
    const previousData: any = await getSyncData();
    const updatedNotes = {
      ...previousData[env][id],
      notes: previousData[env][id].notes.filter((n: any) => n !== note),
    };
    chrome.storage.sync.set(
      { [env]: { ...previousData[env], [id]: updatedNotes } },
      function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          setCurrent({ ...previousData[env], [id]: updatedNotes });
        }
      }
    );
  };

  const remove = async (id: any) => {
    const previousData: any = await getSyncData();
    delete previousData[env][id];
    chrome.storage.sync.set({ [env]: previousData[env] }, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        setCurrent(previousData[env]);
      }
    });
  };

  const districtUrl = user["field-login_as_k12_admin"];

  const getDistrictUrl = (isLocalhost: boolean) => {
    const urlParams = new URL(districtUrl);
    urlParams.searchParams.set("is_localhost", isLocalhost ? "1" : "");
    return urlParams.toString();
  };

  return (
    <Collapsible className="rounded-md border p-1 pr-4 shadow-sm">
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <CaretSortIcon className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <div className="flex items-center justify-between space-x-4 w-full">
          <h4 className="text-sm font-semibold">
            {user["field-name"]} {user["field-first_name"]}{" "}
            {user["field-last_name"]}
          </h4>
          <div>
            <a
              href={
                districtUrl
                  ? getDistrictUrl(false)
                  : `https://api${
                      env === "prod" ? "" : "-" + env
                    }.schoolinks.com/api/v1/sl_users/instant-login/${
                      user["field-id"]
                    }/?is_localhost=&redirect_url=%2F`
              }
              target="_blank"
              className="text-sm text-muted-foreground"
            >
              Instant
            </a>{" "}
            {env !== "prod" && (
              <>
                /{" "}
                <a
                  href={
                    districtUrl
                      ? getDistrictUrl(true)
                      : `https://api${
                          env === "prod" ? "" : "-" + env
                        }.schoolinks.com/api/v1/sl_users/instant-login/${
                          user["field-id"]
                        }/?is_localhost=1&redirect_url=%2F`
                  }
                  target="_blank"
                  className="text-sm text-muted-foreground"
                >
                  Local
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <CollapsibleContent className="pl-4">
        <div className="flex gap-x-1 items-center">
          <h4 className="text-sm font-medium leading-none">Id: </h4>
          <p className="text-sm text-muted-foreground">
            {user["field-id"] || "n/a"}
          </p>
        </div>
        <div className="flex gap-x-1 items-center">
          <h4 className="text-sm font-medium leading-none">Email: </h4>
          <p className="text-sm text-muted-foreground">
            {user["field-email"] || "n/a"}
          </p>
        </div>
        <div className="flex gap-x-1 items-center">
          <h4 className="text-sm font-medium leading-none">User type: </h4>
          <p className="text-sm text-muted-foreground">
            {user["field-user_type"] || "n/a"}
          </p>
        </div>
        <div className="flex gap-x-1 items-center">
          <h4 className="text-sm font-medium leading-none">Grade: </h4>
          <p className="text-sm text-muted-foreground">
            {user["field-grade"] || "n/a"}
          </p>
        </div>
        {(user.notes || []).length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {(user.notes || []).map((note: any) => (
              <DeleteNotePopover
                note={note}
                user={user}
                removeNote={removeNote}
              />
            ))}
          </div>
        )}
        <div className="flex gap-x-2 mt-2 items-center mb-2">
          <Input
            placeholder="Add note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <RemoveUserPopover removeUser={() => remove(user["field-id"])} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default Row;
