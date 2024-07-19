import { getCurrentInstance } from "vue";

export const uuid = () => {
    var temp_url = URL.createObjectURL(new Blob());
    var uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf("/") + 1);
}

export const clone = function (obj: any) {
    let newObj: any = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key] === 'object') {
            newObj[key] = clone(obj[key]);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }
    return newObj;
  };


const BASE64_REPLACE_CHAR = '__REPLACE__'
export const encode = (str: string) => {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace('/', BASE64_REPLACE_CHAR)
}

export const decode = (str: string) => {
  if (!str) return ''
  return new TextDecoder().decode(Uint8Array.from(atob(str.replace(BASE64_REPLACE_CHAR, '/')), (c) => c.charCodeAt(0)))
}


export const listAssign = (arrA, arrB) =>{
  Object.keys(arrA).forEach( key => {
    if (arrB[key] != undefined) {
      arrA[key] = arrB[key]
    }
  })
}

export const isSetupEnvironment = ()  =>{
  return getCurrentInstance() !== null
}