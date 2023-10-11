import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSyncData = ({
  keys = null,
  isExport = false,
}: {
  keys?: string | string[] | null;
  isExport?: boolean;
} = {}) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(isExport ? null : keys, function (result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
};

export const setSyncData = ({ items = {} }: { items: object }) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Set", items);
        resolve(items);
      }
    });
  });
};

export const getFullName = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  return firstName?.concat(" ").concat(lastName);
};
