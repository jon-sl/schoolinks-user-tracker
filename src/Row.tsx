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
import { Input } from "@/components/ui/input";
import { CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { setSyncData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ConfirmationPopover from "@/src/ConfirmationPopover";

function Row({ env, user, setCurrent, getSyncData, isDevMode }: any) {
  const id = user["field-id"];
  const [notes, setNotes] = useState("");

  const handleKeyDown = async (e: any) => {
    if (e.key === "Enter") {
      const previousData: any = await getSyncData();
      const updatedData = {
        ...previousData[env][id],
        notes: [...(previousData[env][id].notes || []), ...notes.split(",")],
      };
      await setSyncData({
        items: { [env]: { ...previousData[env], [id]: updatedData } },
      }).then(() => {
        setCurrent({ ...previousData[env], [id]: updatedData });
        setNotes("");
      });
    }
  };

  const removeNote = async (id: any, note: string) => {
    const previousData: any = await getSyncData();
    const updatedNotes = {
      ...previousData[env][id],
      notes: previousData[env][id].notes.filter((n: any) => n !== note),
    };
    await setSyncData({
      items: { [env]: { ...previousData[env], [id]: updatedNotes } },
    }).then(() => {
      setCurrent({ ...previousData[env], [id]: updatedNotes });
    });
  };

  const remove = async (id: any) => {
    const previousData: any = await getSyncData();
    delete previousData[env][id];
    await setSyncData({
      items: { [env]: previousData[env] },
    }).then(() => {
      setCurrent(previousData[env]);
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
            {user["field-name"] || user["field-district_name"]}{" "}
            {user["field-first_name"] || user["field-user_first_name"]}{" "}
            {user["field-last_name"] || user["field-user_last_name"]}
          </h4>
          <div>
            <a
              href={districtUrl ? getDistrictUrl(false) : user["instant"]}
              target="_blank"
              className="text-sm text-muted-foreground"
            >
              Instant
            </a>{" "}
            {env !== "prod" && isDevMode && (
              <>
                /{" "}
                <a
                  href={districtUrl ? getDistrictUrl(true) : user["local"]}
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
            {user["field-email"] || user["field-user_email"] || "n/a"}
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
              <ConfirmationPopover
                prompt="Remove note?"
                renderElement={() => <Badge>{note}</Badge>}
                remove={() => removeNote(id, note)}
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
          <ConfirmationPopover
            prompt="Remove user?"
            renderElement={() => (
              <Button variant="destructive" size="sm">
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            )}
            remove={() => remove(id)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default Row;
