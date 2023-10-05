/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import "./App.css";
import Row from "./Row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import _ from "lodash";
import { useEffect, useState, useMemo } from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [env, setEnv] = useState("qa");
  const [current, setCurrent] = useState({});

  const getFavoritedList = () => {
    chrome.storage.sync.get([env], function (result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        setCurrent(result[env] || {});
      }
    });
  };

  const getSyncData = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([env], function (result) {
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
        return email || fullName || id || userType || grade || note.length > 0;
      }),
    [current, searchTerm]
  );

  return (
    <div className="container">
      <Select
        value={env}
        onValueChange={(e) => {
          setEnv(e);
          chrome.storage.sync.set({ selectedEnv: e });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dev-blue">dev-blue</SelectItem>
          <SelectItem value="dev-green">dev-green</SelectItem>
          <SelectItem value="dev-purple">dev-purple</SelectItem>
          <SelectItem value="dev-red">dev-red</SelectItem>
          <SelectItem value="qa">qa</SelectItem>
          <SelectItem value="staging">staging</SelectItem>
          <SelectItem value="stable">stable</SelectItem>
          <SelectItem value="prod">prod</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
      />
      <Separator className="my-2" />
      {!current || Object.entries(current).length === 0 ? (
        <>No favorites yet</>
      ) : (
        <>
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
            <>No results found</>
          )}
        </>
      )}
    </div>
  );
}

export default App;
