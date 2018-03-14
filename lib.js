
export function distance(lat1, lon1, lat2, lon2) {
    let toRad = (a) => {
        return a * Math.PI / 180;
    }

    var R = 6371e3; // metres
    var φ1 = toRad(lat1);
    var φ2 = toRad(lat2);
    var Δφ = toRad(lat2 - lat1);
    var Δλ = toRad(lon2 - lon1);

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}

// d in meters
export function formatDistance(d) {
    if (d < 1000) return d + ' m';
    return (round(d/1000,1) + ' km').replace(/\./, ',');
}

export function round(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};





export function long2tile(lon,zoom) {
  let x = (lon+180)/360*Math.pow(2,zoom);
  let ix = Math.floor(x);
  let itx = x - ix;
  return {x: ix, inTileX: itx};
}
export function lat2tile(lat,zoom)  {
  let y = (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom);
  let iy = Math.floor(y);
  let ity = y - iy;

  return {y: iy, inTileY: ity};
}
export function tile2long(x,z) {
 return (x/Math.pow(2,z)*360-180);
}
export function tile2lat(y,z) {
 var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
 return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}


export class LatLonHelper {

  constructor(clat, clon, zoom, width, height, tsize) {
    this.clat = clat;       // lat-lon-Koordinaten im Mittelpunkt der Karte
    this.clon = clon;
    this.zoom = zoom;       // ZoomLevel 0 - ca. 20
    this.width = width;     // Größe der Map
    this.height = height;   //
    this.tsize = tsize;     // Größe einer Kachel

    let wmx = width/2;      // Die Pixel-Mitte der Karte
    let wmy = height/2;

    // Welche Kachel gehört zum Pixel-Mittelpunkt der Karte?
    // x|y sind Spalte und Reihe der Kachel.
    // inTileX|inTileY gibt indirekt die Position des Mittelpunktes relativ zur Kachel (0-1):
    // (Man muss die Kachel um inTileX * tile_size verschieben, um die Mitte in die Mitte zu bekommen....
    let {x, inTileX} = long2tile(this.clon, this.zoom);
    let {y, inTileY} = lat2tile(this.clat, this.zoom);
    this.cInTileX = inTileX;
    this.cInTileY = inTileY;
    this.cC = x;
    this.cR = y;

    // Wo liegt die obere linke Ecke der Mitte-Kachel?
    // Kachel wird so verschoben, dass der Punkt (clat|clon) in der Pixelmitte der Karte liegt.
    this.offsetX = wmx - this.cInTileX * this.tsize;
    this.offsetY = wmy - this.cInTileY * this.tsize;

    // Jetzt wird berechnet, wieviele Kacheln wir nach links und nach oben brauchen,
    // um die Lücke zwischen Mittelkachel und Rand zu füllen.
    // Dazu werden die Koordinaten der erste darzustellenden Kachel berechnet (oben links):
    this.startC = this.cC - Math.ceil(this.offsetX / this.tsize);
    this.startR = this.cR - Math.ceil(this.offsetY / this.tsize);

    // wieviel stehen die kacheln oben und links über?
    // Die Pixel-Position der ersten dargestellten Kachel (positive Werte, die nacher subtrahiert werden.)
    this.tStartX = (Math.ceil(this.offsetX / this.tsize) * this.tsize) - this.offsetX;
    this.tStartY = (Math.ceil(this.offsetY / this.tsize) * this.tsize) - this.offsetY;


  }

  // Anzahl benötigter Kacheln
  getTileCols() {
    return Math.ceil((this.width + this.tStartX) / this.tsize);
  }

  // Anzahl benötigter Kacheln
  getTileRows() {
    return Math.ceil((this.height + this.tStartY) / this.tsize);
  }


  latlon2xy(lat, lon) {
    let {x, inTileX} = long2tile(lon, this.zoom);
    let {y, inTileY} = lat2tile(lat, this.zoom);
    x = -this.tStartX + (x-this.startC + inTileX) * this.tsize;
    y = -this.tStartY + (y-this.startR + inTileY) * this.tsize;
    return {x,y};
  }

  xy2latlon(x, y) {
    x = ((x+this.tStartX) / this.tsize) + this.startC;
    y = ((y+this.tStartY) / this.tsize) + this.startR;
    return {lat: tile2lat(y, this.zoom), lon: tile2long(x, this.zoom)};
  }



}






export function renderIf(condition, content, elseContent) {
    if (condition) {
      if (content) return content();
    } else {
        if (elseContent) return elseContent();
    }
    return null;
}
