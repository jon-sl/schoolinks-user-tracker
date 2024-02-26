/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import { getSyncData, setSyncData } from "@/lib/utils";

function App() {
  const getEnv = () => {
    if (window.location.hostname.split(".")[1].includes("schoolinks")) {
      return "prod";
    } else {
      return window.location.hostname.split(".")[1];
    }
  };

  const env = getEnv();

  const loginLinkFields = document.getElementsByClassName("field-login_link");
  const k12LoginLinkFields = document.getElementsByClassName(
    "field-login_as_k12_admin"
  );
  const linkFields =
    loginLinkFields.length === 0 ? k12LoginLinkFields : loginLinkFields;
  for (let i = 0; i < linkFields.length; i++) {
    linkFields[i].innerHTML = `${linkFields[i].innerHTML}<br><br>`;
    const fave = document.createElement("a");
    fave.href = "#";
    fave.textContent = "Favorite";
    fave.onclick = async () => {
      const tableRow = linkFields[i].parentNode;
      const rowData: any = {};
      let fieldId: any;
      tableRow?.querySelectorAll("td[class], th[class]").forEach((td) => {
        const className = td.className;
        const textContent = td.textContent?.trim();
        rowData[className] = textContent;
        if (className === "field-login_as_k12_admin") {
          const firstAnchor = td.querySelector("a");
          const hrefValue = firstAnchor?.getAttribute("href");
          const url = new URL(hrefValue || "");
          rowData[className] = `${url.origin}${url.pathname}`;
          fieldId = rowData["field-id"];
        }
        if (className === "field-login_link") {
          const firstAnchor = td
            .querySelectorAll("a")?.[0]
            ?.getAttribute("href");
          const secondAnchor = td
            .querySelectorAll("a")?.[1]
            ?.getAttribute("href");
          rowData.instant = firstAnchor;
          rowData.local = secondAnchor;
          fieldId = rowData["field-id"] || firstAnchor?.split("/")?.[7];
          rowData["field-id"] = fieldId;
        }
      });
      const previousData: any = await getSyncData({ keys: env });
      await setSyncData({
        items: { [env]: { ...previousData[env], [fieldId]: rowData } },
      }).then(() => {
        console.log(rowData);
      });
    };
    linkFields[i].appendChild(fave);
  }

  return <></>;
}

export default App;
