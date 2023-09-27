/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import "./App.css";
import Row from './Row';

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
        const email = item["field-email"]?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const firstName = item["field-first_name"]?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const lastName = item["field-last_name"]?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const id = item["field-id"]?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const userType = item["field-user_type"]?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const note = (item.notes || []).filter((note: any) => note.toLowerCase().includes(searchTerm.toLowerCase()));
        return email || firstName || lastName || id || userType || note.length > 0;
      }),
    [current, searchTerm]
  );

  return (
    <div className="container">
      <select
        value={env}
        onChange={(e) => {
          setEnv(e.target.value);
          chrome.storage.sync.set({ selectedEnv: e.target.value });
        }}
      >
        <option value="dev-blue">dev-blue</option>
        <option value="dev-green">dev-green</option>
        <option value="dev-purple">dev-purple</option>
        <option value="dev-red">dev-red</option>
        <option value="qa">qa</option>
        <option value="staging">staging</option>
        <option value="stable">stable</option>
        <option value="prod">prod</option>
      </select>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {!current || Object.entries(current).length === 0 ? (
        <>No favorites yet</>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Login</th>
              <th>Notes</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((user: any) => {
              return (
                <Row key={user["field-id"]} user={user} env={env} setCurrent={setCurrent} getSyncData={getSyncData} />
              );
            }) : <>No results found</>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
