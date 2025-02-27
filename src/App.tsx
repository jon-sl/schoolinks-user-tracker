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
import { Toggle } from "@/components/ui/toggle";
import { environments } from "@/lib/constants";
import { getSyncData, setSyncData, getFullName } from "@/lib/utils";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [env, setEnv] = useState("qa");
  const [isDevMode, setIsDevMode] = useState(false);
  const [current, setCurrent] = useState({});
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [requiresVPN, setRequiresVPN] = useState(false);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await fetch(
          "https://app.schoolinks.com/sl-admin/login/?next=/sl-admin/"
        );
        const res = await response;
        if (res.status === 403) {
          setRequiresVPN(true);
          return;
        }
      } catch (error) {
        console.error(error);
      }
      setRequiresVPN(false);
    };
    fetchVPNStatus();

    // Get last environment selected
    const getCurrentEnv = async () => {
      const result: any = await getSyncData({ keys: "selectedEnv" });
      setEnv(result.selectedEnv || "qa");
    };
    const getDevModeState = async () => {
      const result: any = await getSyncData({ keys: "devModeState" });
      setIsDevMode(result.devModeState);
    };
    getCurrentEnv();
    getDevModeState();
  }, []);

  useEffect(() => {
    // Backdoor to deactivate vpn check
    if (searchTerm === "opensesame123") {
      setRequiresVPN(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Update data when user changes environment
    const getEnvData = async () => {
      const result: any = await getSyncData({ keys: env });
      setCurrent(result[env] || {});
    };
    getEnvData();
  }, [env]);

  const filteredData = useMemo(
    () =>
      _.filter(Object.values(current), (item: any) => {
        const email = (item["field-email"] || item["field-user_email"])
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const fullName = getFullName({
          firstName: item["field-first_name"] || item["field-user_first_name"],
          lastName: item["field-last_name"] || item["field-user_last_name"],
        })
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
        const districtName = (item["field-name"] || item["field-district_name"])
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

  const getEnvColor = (e?: string) => {
    switch (e || env) {
      case "dataops":
        return "text-dataops";
      case "dev-blue":
        return "text-dev-blue";
      case "qa-dev":
        return "text-qa-blue";
      case "dev-green":
        return "text-dev-green";
      case "dev-purple":
        return "text-dev-purple";
      case "dev-lavender":
        return "text-dev-lavender";
      case "dev-indigo":
        return "text-dev-indigo";
      case "dev-red":
        return "text-dev-red";
      case "dev-crimson":
        return "text-dev-crimson";
      case "dev-ruby":
        return "text-dev-ruby";
      case "act2":
        return "text-act2";
      case "qa":
        return "text-qa";
      case "qa-blue":
        return "text-qa-blue";
      case "staging":
        return "text-staging";
      case "stable":
        return "text-stable";
      case "prod":
        return "text-prod";
      default:
        return "";
    }
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
              className={`w-[250px] justify-between font-bold ${getEnvColor()}`}
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
                {environments.slice(isDevMode ? 0 : 7).map((e) => (
                  <CommandItem
                    key={e.value}
                    className={`font-bold ${getEnvColor(e.value)}`}
                    onSelect={async (currentValue) => {
                      setEnv(currentValue);
                      await setSyncData({
                        items: { selectedEnv: currentValue },
                      }).then(() => {
                        setEnv(currentValue === env ? "" : currentValue);
                        setOpen(false);
                      });
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
              <DialogTitle className="mb-2">⚙️ Config</DialogTitle>
              <DialogDescription className="flex flex-col gap-4">
                <p>
                  This Chrome extension is currently in beta mode so there may
                  be occasional bugs or unexpected behavior. If you encounter
                  any issues or have suggestions for enhancements, please don't
                  hesitate to reach out.
                </p>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="backup">💻 Toggle development mode</Label>
                  <Toggle
                    pressed={isDevMode}
                    onPressedChange={async (currentValue) => {
                      await setSyncData({
                        items: {
                          devModeState: currentValue,
                        },
                      }).then(() => {
                        setIsDevMode(currentValue);
                      });
                    }}
                  >
                    {isDevMode ? "Disable dev mode" : "Enable dev mode"}
                  </Toggle>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="backup">👤 Import/export users</Label>
                  <div className="flex items-end gap-2">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Input
                        placeholder="Import backup"
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
                    <Button
                      disabled={!file}
                      onClick={async () => {
                        const reader = new FileReader();
                        reader.onload = async function (event) {
                          const fileContent: any = event.target!.result;
                          try {
                            const jsonObject = JSON.parse(fileContent);
                            await setSyncData({ items: jsonObject }).then(
                              async () => {
                                setFile(null);
                                const result: any = await getSyncData({
                                  keys: env,
                                });
                                setCurrent(result[env] || {});
                              }
                            );
                          } catch (error) {
                            console.error("Error parsing JSON:", error);
                          }
                        };
                        reader.readAsText(file!);
                      }}
                    >
                      Import
                    </Button>
                  </div>
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
      {requiresVPN ? (
        <div className="flex flex-col gap-y-2">
          <h2 className="scroll-m-20 pb-1 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
            🚫
          </h2>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">
            Unable to access
          </h4>
          <p className="leading-7 text-center mt-0">
            Please ensure that you are connected to the required VPN
          </p>
        </div>
      ) : (
        <>
          {!current || Object.entries(current).length === 0 ? (
            <div className="flex flex-col gap-y-2">
              <h2 className="scroll-m-20 pb-1 text-3xl font-semibold tracking-tight transition-colors first:mt-0 text-center">
                🤠
              </h2>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">
                No favorites yet
              </h4>
              <p className="leading-7 text-center mt-0">
                Go to{" "}
                <a
                  href={`https://${
                    env === "prod" ? "app" : "" + env
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
                      isDevMode={isDevMode}
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
        </>
      )}
    </div>
  );
}

export default App;
