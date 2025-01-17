/* eslint-disable */ 
declare module 'xml2js' {
    export function parseStringPromise(xml: string): Promise<any>;
    export const Builder: any;
  }