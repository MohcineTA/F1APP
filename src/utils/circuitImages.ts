const CDN = 'https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_1320/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9';

export const CIRCUIT_IMAGES: Record<string, string> = {
  albert_park:  `${CDN}/Australia_Circuit`,
  bahrain:      `${CDN}/Bahrain_Circuit`,
  jeddah:       `${CDN}/Saudi_Arabia_Circuit`,
  suzuka:       `${CDN}/Japan_Circuit`,
  shanghai:     `${CDN}/China_Circuit`,
  miami:        `${CDN}/Miami_Circuit`,
  imola:        `${CDN}/Emilia_Romagna_Circuit`,
  monaco:       `${CDN}/Monaco_Circuit`,
  villeneuve:   `${CDN}/Canada_Circuit`,
  catalunya:    `${CDN}/Spain_Circuit`,
  red_bull_ring:`${CDN}/Austria_Circuit`,
  silverstone:  `${CDN}/Great_Britain_Circuit`,
  hungaroring:  `${CDN}/Hungary_Circuit`,
  spa:          `${CDN}/Belgium_Circuit`,
  zandvoort:    `${CDN}/Netherlands_Circuit`,
  monza:        `${CDN}/Italy_Circuit`,
  baku:         `${CDN}/Azerbaijan_Circuit`,
  marina_bay:   `${CDN}/Singapore_Circuit`,
  americas:     `${CDN}/USA_Circuit`,
  rodriguez:    `${CDN}/Mexico_Circuit`,
  interlagos:   `${CDN}/Brazil_Circuit`,
  las_vegas:    `${CDN}/Las_Vegas_Circuit`,
  losail:       `${CDN}/Qatar_Circuit`,
  yas_marina:   `${CDN}/Abu_Dhabi_Circuit`,
};

export function getCircuitImage(circuitId: string): string | null {
  return CIRCUIT_IMAGES[circuitId] ?? null;
}
