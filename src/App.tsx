/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import Row from "./Row";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import _ from "lodash";
import { useEffect, useState, useMemo } from "react";
import {
  CaretSortIcon,
  CheckIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const environments = [
  {
    value: "dev-blue",
    label: "dev-blue",
  },
  {
    value: "dev-green",
    label: "dev-green",
  },
  {
    value: "dev-purple",
    label: "dev-purple",
  },
  {
    value: "dev-red",
    label: "dev-red",
  },
  {
    value: "qa",
    label: "qa",
  },
  {
    value: "staging",
    label: "staging",
  },
  {
    value: "stable",
    label: "stable",
  },
  {
    value: "prod",
    label: "prod",
  },
];

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [env, setEnv] = useState("qa");
  const [current, setCurrent] = useState({});
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const getFavoritedList = () => {
    chrome.storage.sync.get([env], function (result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        setCurrent(result[env] || {});
      }
    });
  };

  const getSyncData = ({ isExport = false } = {}) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(isExport ? null : [env], function (result) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  };

  useEffect(() => {
    chrome.storage.sync.get("selectedEnv", function (result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        setEnv(result.selectedEnv || "qa");
      }
    });
  }, []);

  useEffect(() => {
    getFavoritedList();
  }, [env]);

  const filteredData = useMemo(
    () =>
      _.filter(Object.values(current), (item: any) => {
        const email = item["field-email"]
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const fullName = item["field-first_name"]
          ?.concat(" ")
          .concat(item["field-last_name"])
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const districtName = item["field-name"]
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const id = item["field-id"]
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const userType = item["field-user_type"]
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const grade = item["field-grade"]
          ?.toString()
          ?.includes(searchTerm.toLowerCase());
        const note = (item.notes || []).filter((note: any) =>
          note.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          email ||
          fullName ||
          districtName ||
          id ||
          userType ||
          grade ||
          note.length > 0
        );
      }),
    [current, searchTerm]
  );

  const download = (content: any, fileName: string, contentType: string) => {
    let a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  return (
    <div className="w-[600px] h-[600px] flex flex-col gap-y-1 p-4">
      <div className="flex items-center gap-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {env
                ? environments.find((e) => e.value === env)?.label
                : "Select env"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search environments" />
              <CommandEmpty>No environment found</CommandEmpty>
              <CommandGroup>
                {environments.map((e) => (
                  <CommandItem
                    key={e.value}
                    onSelect={(currentValue) => {
                      setEnv(currentValue);
                      chrome.storage.sync.set({ selectedEnv: currentValue });
                      setEnv(currentValue === env ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        env === e.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {e.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
        <Dialog>
          <DialogTrigger>
            <Button variant="outline" size="icon">
              <InfoCircledIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="text-start">
              <DialogTitle>Config (WIP)</DialogTitle>
              <DialogDescription className="flex flex-col gap-4 mt-4">
                <div className="flex items-end gap-2">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="backup">Import backup</Label>
                    <Input
                      id="backup"
                      type="file"
                      accept=".json"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files !== null) {
                          setFile(e.target.files![0]);
                        }
                      }}
                    />
                  </div>
                  {file && (
                    <Button
                      onClick={async () => {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                          const fileContent: any = event.target!.result;
                          try {
                            const jsonObject = JSON.parse(fileContent);
                            chrome.storage.sync.set(jsonObject, function () {
                              if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                              } else {
                                console.log("Imported backup successfully!");
                                setFile(null);
                                getFavoritedList();
                              }
                            });
                          } catch (error) {
                            console.error("Error parsing JSON:", error);
                          }
                        };
                        reader.readAsText(file);
                      }}
                    >
                      Import
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const res = await getSyncData({ isExport: true });
                    download(
                      JSON.stringify(res),
                      `backup_${new Date().toJSON()}.json`,
                      "application/json"
                    );
                  }}
                >
                  Export backup
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-2" />
      {!current || Object.entries(current).length === 0 ? (
        <div className="flex flex-col gap-y-2">
          <h2 className="scroll-m-20 pb-1 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
            🤠
          </h2>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">
            No favorites yet!
          </h4>
          <p className="leading-7 text-center mt-0">
            Go to{" "}
            <a
              href={`https://api${
                env === "prod" ? "" : "-" + env
              }.schoolinks.com/sl-admin/`}
              target="_blank"
              className="underline text-muted-foreground"
            >
              Django Admin
            </a>{" "}
            and start favoriting some users!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-1 overflow-auto">
          {filteredData.length > 0 ? (
            filteredData.map((user: any) => {
              return (
                <Row
                  key={user["field-id"]}
                  user={user}
                  env={env}
                  setCurrent={setCurrent}
                  getSyncData={getSyncData}
                />
              );
            })
          ) : (
            <div className="flex flex-col gap-y-2 h-full justify-center">
              <h2 className="scroll-m-20 pb-1 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
                😔
              </h2>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">
                No results found
              </h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
