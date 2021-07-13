import { logger } from "@gatsby-cloud-pkg/lib-util"
import { readFileSync } from "fs"
import { Reader, Asn, City } from "@maxmind/geoip2-node"
import time, { TimeUnit } from "@turist/time"
import { gunzipSync }  from "zlib"
import { resolve } from "path"

const LRU = require(`lru-cache`)

const ipData = new LRU({
  max: 50000,
  maxAge: time(1, TimeUnit.Hour),
})

export type IpData = {
  autonomousSystemNumber?: number
  latitude?: number
  longitude?: number
  zipCode?: number
  city?: string
  state?: string
  country?: string
}

// Gzipped to fit in git
const asnDbBuffer = gunzipSync(readFileSync(resolve(__dirname, `../maxminddata/GeoLite2-ASN.mmdb.gz`)))
const cityDbBuffer = gunzipSync(readFileSync(resolve(__dirname, `../maxminddata/GeoLite2-City.mmdb.gz`)))

const asnReader = Reader.openBuffer(asnDbBuffer)
const cityReader = Reader.openBuffer(cityDbBuffer)

function getAsn(ip: string): Asn {
  try {
    return asnReader.asn(ip)
  } catch (e) {
    logger.debug(`Cannot get ANS data for ${ip}`, { error: e })
    return null
  }
}

function getCity(ip: string): City {
  try {
    return cityReader.city(ip)
  } catch (e) {
    logger.debug(`Cannot get City data for ${ip}`, { error: e })
    return null
  }
}

function getDataRaw(ip: string): IpData {
  const data: IpData = {}

  const asnData = getAsn(ip)
  if (asnData) {
    try {
      data.autonomousSystemNumber = asnData.autonomousSystemNumber
    } catch (e) {
      logger.debug(`failed to extract ASN data ${ip}`, { error: e })
    }
  }

  const cityData = getCity(ip)
  if (cityData) {
    try {
      data.zipCode = (cityData.postal as { code: number })?.code
      data.state = cityData?.subdivisions[0]?.isoCode
      data.city = (cityData.city as { names?: { en?: string } })?.names?.en
      data.country = (cityData.country as { isoCode?: string })?.isoCode

      const locationData = cityData.location as {
        accuracyRadius: any
        latitude: any
        longitude: any
      }

      data.latitude = locationData?.latitude
      data.longitude = locationData?.longitude
    } catch (e) {
      logger.error(`failed to extract city data ${ip}`, { error: e })
    }
  }

  return data
}

export function getIpMetadata(ip: string): IpData {
  const value = ipData.get(ip)
  if (value) {
    return value
  }
  const newValue = getDataRaw(ip)
  ipData.set(ip, newValue)

  return newValue
}
