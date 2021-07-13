import { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";

import https from "https";
const agent = new https.Agent({
  rejectUnauthorized: false
});
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { Reader, Asn, City } from "@maxmind/geoip2-node";
import { gunzipSync } from "zlib";
import { execSync } from "child_process";
import { resolve } from "path";

const exec = (cmd, ...params) => {
  console.log(`running: "${cmd}, ${params}"`);
  const res = execSync(cmd, params);
  return String(res);
};

console.log(exec(`env`));
console.log(exec(`pwd`));
console.log(exec(`ls`, `-la`))
console.log(exec(`cat`, `/var/run/secrets/kubernetes.io/serviceaccount/token`))
  //const asnDbBuffer = gunzipSync(readFileSync(resolve(__dirname, `../../public/static/GeoLite2-ASN.mmdb.gz`)));
  // const cityDbBuffer = gunzipSync(readFileSync(resolve(__dirname, `../../public/static/GeoLite2-City.mmdb.gz`)));

  //const asnDbBuffer = gunzipSync(readFileSync(`/app/services/gatsby-functions/src/GeoLite2-ASN.mmdb.gz`));
  //const cityDbBuffer = gunzipSync(readFileSync(`/app/services/gatsby-functions/src/GeoLite2-City.mmdb.gz`));
  //
  //const asnReader = Reader.openBuffer(asnDbBuffer);
  //const cityReader = Reader.openBuffer(cityDbBuffer);
  //
  //function getAsn(ip: string): Asn {
  //  try {
  //    return asnReader.asn(ip);
  //  } catch (e) {
  //    return null;
  //  }
  //}
  //
  //function getCity(ip: string): City {
  //  try {
  //    return cityReader.city(ip);
  //  } catch (e) {
  //    return null;
  //  }
  //}
  //
  //export type IpData = {
  //  autonomousSystemNumber?: number;
  //  latitude?: number;
  //  longitude?: number;
  //  zipCode?: number;
  //  city?: string;
  //  state?: string;
  //  country?: string;
  //};
  //function getDataRaw(ip: string): IpData {
  //  const data: IpData = {};
  //  const asnData = getAsn(ip);
  //  if (asnData) {
  //    try {
  //      data.autonomousSystemNumber = asnData.autonomousSystemNumber;
  //    } catch (e) {
  //      logger.debug(`failed to extract ASN data ${ip}`, { error: e });
  //    }
  //  }
  //
  //  const cityData = getCity(ip);
  //  if (cityData) {
  //    try {
  //      data.zipCode = (cityData.postal as { code: number })?.code;
  //      data.state = cityData?.subdivisions[0]?.isoCode;
  //      data.city = (cityData.city as { names?: { en?: string } })?.names?.en;
  //      data.country = (cityData.country as { isoCode?: string })?.isoCode;
  //
  //      const locationData = cityData.location as {
  //        accuracyRadius: any;
  //        latitude: any;
  //        longitude: any;
  //      };
  //
  //      data.latitude = locationData?.latitude;
  //      data.longitude = locationData?.longitude;
  //    } catch (e) {
  //      logger.error(`failed to extract city data ${ip}`, { error: e });
  //    }
  //  }
  //
  //  return data;
  //}



export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse) {
  const headers = req.headers;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ress = await fetch(`https://10.26.0.1`, { agent });

  console.log(ress.status);
  const text = await ress.text()
  console.log(text);
  //
  //
  //  res.status(200).json({data, ip, headers});
  //  const data = getDataRaw(ip)
  res.status(200).json({ ip, headers });
}
