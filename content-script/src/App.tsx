/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

function App() {
    const env = window.location.hostname.split('.')[0].split('-')[1] || 'prod';


    const getSyncData = () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get([env], function(result) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });
    }
    
    
    const loginLinkFields = document.getElementsByClassName('field-login_link');
    const k12LoginLinkFields = document.getElementsByClassName('field-login_as_k12_admin');
    const linkFields = loginLinkFields.length === 0 ? k12LoginLinkFields : loginLinkFields;
    for (let i = 0; i < linkFields.length; i++) {
      linkFields[i].innerHTML = `${linkFields[i].innerHTML}<br><br>`;
      const fave = document.createElement('a');
      fave.href = '#';
      fave.textContent = 'Favorite';
      fave.onclick = async () => {
        const tableRow = linkFields[i].parentNode;
        const rowData: any = {};
        tableRow?.querySelectorAll('td[class], th[class]').forEach((td) => {
          const className = td.className;
          const textContent = td.textContent?.trim();
          rowData[className] = textContent;
          if (className === 'field-login_as_k12_admin') {
            const firstAnchor = td.querySelector('a');
            const hrefValue = firstAnchor?.getAttribute('href');
            const url = new URL(hrefValue || '');
            rowData[className] = `${url.origin}${url.pathname}`;
          }
        });
        const fieldId = rowData["field-id"];
        const previousData: any = await getSyncData();
        await chrome.storage.sync.set({ [env]: { ...previousData[env], [fieldId]: rowData } }, function() {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log('Favorited', rowData);
          }
        });
      };
      linkFields[i].appendChild(fave);
    }

    return <></>;
}

export default App;
