/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import _ from "lodash";
import { useState } from "react";

import "./Row.css";

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
    <tr key={user["field-id"]}>
      <td>
        {user["field-name"]} {user["field-first_name"]}{" "}
        {user["field-last_name"]}
      </td>
      <td>
        <a
          href={
            districtUrl
              ? getDistrictUrl(false)
              : `https://api-${env}.schoolinks.com/api/v1/sl_users/instant-login/${user["field-id"]}/?is_localhost=&redirect_url=%2F`
          }
          target="_blank"
        >
          Instant
        </a>{" "}
        |{" "}
        <a
          href={
            districtUrl
              ? getDistrictUrl(true)
              : `https://api-${env}.schoolinks.com/api/v1/sl_users/instant-login/${user["field-id"]}/?is_localhost=1&redirect_url=%2F`
          }
          target="_blank"
        >
          Localhost
        </a>
      </td>
      <td>
        {(user.notes || []).map((note: any) => (
          <div className="note">
            <small>{note}</small>
            <small className="removeNote" onClick={() => removeNote(user["field-id"], note)}>x</small>
          </div>
        ))}
        <input
          placeholder="Add note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td>
        <a href="#" onClick={() => remove(user["field-id"])}>
          X
        </a>
      </td>
    </tr>
  );
}

export default Row;
