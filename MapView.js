import React, { Component } from 'react';


import {
  View,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';

//import {dbg2} from '../../utilities';
import {LatLonHelper, tile2long, tile2lat, renderIf} from './lib';
import {Marker} from './Marker';

const LOAD_TILES = true;
//const LOAD_TILES = false;

const TILE_BORDER = false;


const TOUCHE_MOVE = true;






/*
https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
   180°W  180°E
X   0 -   2^Z-1

   85.0511 °N     85.0511 °S
Y     0           2zoom − 1
85.0511 is the result of arctan(sinh(π))



*/





// Marker auf karze setzen:
// http://www.openstreetmap.org/?mlat=47.5433&mlon=-52.8734&zoom=12#map=11/47.5434/-52.8731


export default class MapView extends Component {


  constructor(props) {
    super(props);

    this.onResponderMove = this.onResponderMove.bind(this);

    this.state = {
      centerLat: props.center.lat,
      centerLon: props.center.lon,
      Z: props.zoom,
      width:0,
      height:0,
      pointTo: null,
    };

    this.lx = null;
    this.ly = null;

    this.llH = null;
  }



  render() {

    const original_tile_size = 256;
    const tile_size = original_tile_size;

    /*
    lon = x
    lat = y
    */

    this.llH = new LatLonHelper(
      this.state.centerLat,
      this.state.centerLon,
      this.state.Z,
      this.state.width,
      this.state.height,
      tile_size
    );


    let tiles = [];

    let tcols = this.llH.getTileCols();
    let trows = this.llH.getTileRows();

    let a = "";
    let uri;

    for (let r = this.llH.startR; r < this.llH.startR+trows; r++) {
      for (let c = this.llH.startC; c < this.llH.startC+tcols; c++) {
        if (LOAD_TILES) {
          uri = this.props.getTileUrl(this.llH.zoom, c, r);
        } else {
          // platzhalter bild
          uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACW0lEQVRIS+2WX0uUQRTGn3NmXf+gEmFEsYLrO7sJeyl0HRVdFETQRQZBGhqJZFkfwArsxqJQkrwrwQq8rCCw7roLupCsdvd9XySCCCuSClx355xYzU1Wlz5AO3dzODM/5pkzzxxChdHZ2Vnzc2npmBC9yWaz7yrllcdTsdT2fDR3Fur6xJiLtCkhlWrM53J9cBgCoxWAksqsEt3OBMGz4nwrmLU2xYoLAE5B3CeAWoh4uASw1u4wqoMKGnDQZUM0Lk6usOFLcNgrkC4YDo1grLaxYWpubu4XAEq0J44QyQWADgD6QojGfN9/6nne24jSXUomky0oFK6CuAcOoTLdjNZHp+fn51eS8fZlEA5mwvBlPB7fWWNMPxTnAEQhNAPofiHZRcxTIBrfKKXnee/XAJ53GqojRNSbXpOgNDYC1oPW2lpW7YLopBDfEci1MAyXymUrARJeopsh3ekg2FeetBWgBIrHvzDVdGXCzPOt7qQKgK1KVKyMahWtvuTqQ/uPrcJa2wwni0SmJxtmH5Q7ZiWr+GPnJwAaI6XhTVVU3JiUBpV0iBU/RKWFiV4T0Y207z9e/zLLAR1tHW3O5PtV9IxhblCVh4hE/gIc0dH1jUnxlaAju1tbpxf9xeZC7cqAijvvmL4x+Fbe5e9HiD4SIieZxSjRABSHFQhYMZGTwr2FhYXvxVOvnkDFjcIws+pnUhpJh/4jAG6jLLFYrL6hrq4Hzl0GqEmAbcxc/JebIHgiBhO+78+WNwVkrT3EiuuAjmaCYAaA/KNFMXusPa5ALxSvCiqTYRh+qLTmNwGvC+Qa+SJmAAAAAElFTkSuQmCC';
        }
      tiles.push(<Image
        key={"tile-"+c+"-"+r}
        source={{uri:uri}}
        style={{
          width: tile_size - (TILE_BORDER ? 1 : 0), height: tile_size - (TILE_BORDER ? 1 : 0),
          position:"absolute",
          left:-this.llH.tStartX +  (c-this.llH.startC)*(this.llH.tsize),
          top: -this.llH.tStartY +  (r-this.llH.startR)*(this.llH.tsize),
        }}
        />);
      }
    }




    let markers = [];
    let clipth = 15;
    //markers.push(<Marker key="centerPoint" x={wmx} y={wmy} />);
    this.props.markers.forEach((e,i)=>{
      let {x,y} = this.llH.latlon2xy(e.lat, e.lon);
      if (x > -clipth && x < this.state.width+clipth && y > -clipth && y < this.state.height+clipth) {
        markers.push(<Marker {...e} onPress={this.props.onMarkerPress} key={""+i} x={x} y={y} />);
      }
    });

    if (this.state.pointTo) {
      let {x,y} = this.llH.latlon2xy(this.state.pointTo.lat, this.state.pointTo.lon);
      if (x > -clipth && x < this.state.width+clipth && y > -clipth && y < this.state.height+clipth) {
        markers.push(<Marker icon={{source:require('./marker-icons/pointto.png'), width: 32, height: 32, pinX:16, pinY:16}} key={"pointTo"} x={x} y={y} />);
      }
    }




    let move_step_lon = (tile2long(1, this.llH.zoom)-tile2long(0, this.llH.zoom)) / 4;
    let move_step_lat = (tile2lat(2, this.llH.zoom)-tile2lat(1, this.llH.zoom)) * 2;

    let moveButtonStyle = {
      position:'absolute',
      backgroundColor:'rgba(255,255,255,0.7)'
    };

    return (
      <View style={{flex:1}} onLayout={(event) => {
          var {x, y, width, height} = event.nativeEvent.layout;
          this.setState({width,height});
          this.fireRegionChange();
        }}>
        <View style={{flex:1, backgroundColor:'darkred'}}
          onResponderMove={TOUCHE_MOVE ? this.onResponderMove : null}
          onMoveShouldSetResponder={TOUCHE_MOVE ? (e)=>true : null}
          onMoveShouldSetResponderCapture={TOUCHE_MOVE ? (e)=>true : null}
          pointerEvents="box-only"
          onResponderRelease={(evt) => {this.lx=null;this.ly=null;}}
        >
          {tiles}
        </View>

        <View style={{position:"absolute", top:0, left:0, width:this.state.width, height:this.state.height}}>
          {markers}


          {
            renderIf(!TOUCHE_MOVE, ()=>([
              <TouchableOpacity style={{...moveButtonStyle, height:60, width:30, top: (this.state.height-60)/2, right: 0, borderTopLeftRadius:10, borderBottomLeftRadius:10}} onPress={()=>this.move(move_step_lon,0)}>
                <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAArUlEQVRIS7XVwQnCQBRF0ZsCLEEULET7EQUbcWHEnQtrEvuRgeAiBOa9N85sw9yTwA9/oPMZOvdRgB1wAJ7Jy9SAFfAB1sAZGF2kBpTeCbhNYRtRgCZEBWLEASLEBWwkASwkBWSkBZgjZZzv8/+kFbgA1yl6BB7/BKrxgqVfIMVTQI4ngBV3ATvuAFFcBeK4ApSF8wY2wOKc1xaQMqZbYA+8arGl5wqQdH93ugNfPMwmGYditHUAAAAASUVORK5CYII='}} style={{marginLeft:(30-24)/2,marginRight:(30-24)/2,marginBottom:(60-24)/2,marginTop:(60-24)/2, height:24}}/>
              </TouchableOpacity>,
              <TouchableOpacity style={{...moveButtonStyle, height:60, width:30, top: (this.state.height-60)/2, left: 0, borderTopRightRadius:10, borderBottomRightRadius:10 }} onPress={()=>this.move(-move_step_lon,0)}>
                <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAsUlEQVRIS7XVQQrCMBCF4b/30UN14Upa7EUUFLyM0KtUD+FeAikIYjLzJs1+3peEmaRj49VtnE8EOAAP4FnapApMwDmH74D3P0QB1vCUeQTuLU/gCk+w5wTucA8ghVsBOdwChMJrQDi8BJyAS26/aisqbToA11w4Ajf1SSm1aROkNgdhpAakmwkhFiCEWAEZ8QAS4gXciAJ8Iwuwb/3hrDPXAzPwUiZZHdyfOvWKzBv4AB/hKhm95sDLAAAAAElFTkSuQmCC'}} style={{marginLeft:(30-24)/2,marginRight:(30-24)/2,marginBottom:(60-24)/2,marginTop:(60-24)/2,width:24, height:24}}/>
              </TouchableOpacity>,
              <TouchableOpacity style={{...moveButtonStyle, height:30, width:60, top: 0, left: (this.state.width-60)/2, borderBottomLeftRadius:10, borderBottomRightRadius:10 }} onPress={()=>this.move(0,-move_step_lat)}>
                <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAw0lEQVRIS+2TMQoCMRBF32LpJbyKVxGsRMFzCBYqFjYexbN4CCsbGcjCbNg4Py5bCJsuYfJe5idpGHk0I/OZBGHCtRHtgTdwCcmpoEZg8GPatwPOikQVeHjLlSSKwMM3wAw4qZ1Eghx+TeCtKvkmKMHbiCRJSRDBZUmfQIVLklxQCw8lXrAGbmmHvZb2QpXnbjX+TlbA3Ra9YAE8gMMPcN+JpbAEnrnA5nPgpR65UNdhRP9goKsb0WBYH2DqIIz1/yP6AAKHJxmtXi9SAAAAAElFTkSuQmCC'}} style={{marginLeft:(60-24)/2,marginRight:(60-24)/2,marginBottom:(30-24)/2,marginTop:(30-24)/2,width:24, height:24}}/>
              </TouchableOpacity>,
              <TouchableOpacity style={{...moveButtonStyle, height:30, width:60, bottom: 0, left: (this.state.width-60)/2, borderTopLeftRadius:10, borderTopRightRadius:10 }} onPress={()=>this.move(0,move_step_lat)}>
                <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAwklEQVRIS+2UMQrCQBBFX8DWU3gRjyKk1CieQ7AwkMrGk3iV3MFeZCELkzDZmSxsI9ku7OQ95s8kFYVPVZjPKjAT/r+ItsDH7DtdMGLIiHbAG7gBbabkClyAPdAHhhTUwHMAnzMkAX4f3j8Ar6kgPDfAI0Mi4UegiwloW7RUMgvXOohiryQJTwk8cZlwS5CSuOAegSbZiG0ZDVRbbe+vQs4kcky4twNt8C74UkGoPwFfuefWF++NyOLM3q8CM7riEf0AeJ8nGehHY0YAAAAASUVORK5CYII='}} style={{marginLeft:(60-24)/2,marginRight:(60-24)/2,marginBottom:(30-24)/2,marginTop:(30-24)/2,width:24, height:24}}/>
              </TouchableOpacity>
            ]
            ))
          }

          <TouchableOpacity style={{...moveButtonStyle, height:40, width:40, bottom: 60, left: 10, borderRadius:10 }} onPress={()=>this.zoom(1)}>
            <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAj0lEQVRIS+2VUQqAIBBEX1TnjX6CrhDViY1CMYhIZvsogvRTZ2Z11tEC25iABigjfAFmoFP0QgHiujuI7xQ/Vyu+tcCaEJJ8CYjCuYBqFT+36Bwi6ZcREMLor+lViIwaEuZ8gVQDJdsCeKXA4xYNQAtUliPfwPiNj/ktkg5IQH6uP2PR45/+OYwhRECvgrcBMsYjHqwB34oAAAAASUVORK5CYII='}} style={{margin:(40-24)/2,width:24, height:24}}/>
          </TouchableOpacity>
          <TouchableOpacity style={{...moveButtonStyle, height:40, width:40, bottom: 10, left: 10, borderRadius:10 }} onPress={()=>this.zoom(-1)}>
            <Image source={{uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAO0lEQVRIS2NkoDFgpLH5DKMWEAzh0SAaHEH0n6AzKFAAiuRRC/AG4PAIIgrSCGGto0UFwTAaDaIREEQAsxUGE8ZjbJwAAAAASUVORK5CYII='}} style={{margin:(40-24)/2,width:24, height:24}}/>
          </TouchableOpacity>
          <Text style={{position:'absolute', top:20,left:0}}>{this.state.dbg}</Text>
        </View>

      </View>

    );
  }

  setCenter(latlon) {
    this.setState({centerLat: latlon.lat, centerLon: latlon.lon});
  }

  pointTo(latlon, center=false) {
    let o = {pointTo: latlon};
    if (center) {
      o.centerLat = latlon.lat;
      o.centerLon = latlon.lon;
      if (latlon.zoom) {
        o.Z = latlon.zoom;
      }
    }
    this.setState(o);
    this.fireRegionChange();
  }

  zoom(d) {
    let z = this.state.Z+d;
    if (z<0) z = 0;
    if (z>20) z = 20;
    this.setState({Z: z});
    this.fireRegionChange();
  }

  move(x,y) {
    let centerLon = this.state.centerLon+x;
    let centerLat = this.state.centerLat+y;
    this.setState({centerLon, centerLat});
    this.fireRegionChange();
  }

  fireRegionChange() {
    this.props.onRegionChange({lat: this.state.centerLat, lon: this.state.centerLon, deltaLat: 0, deltaLon: 0, zoom: this.state.Z });
  }


  // https://facebook.github.io/react-native/docs/view.html#onrespondermove
  onResponderMove(e) {
    if (!TOUCHE_MOVE) {
      return;
    }

    ne = e.nativeEvent;
    //e.stopPropagation();

    let x = ne.locationX;
    let y = ne.locationY;

    //dbg2(ne);
    //return;


    if (this.lx !== null) {
      let {lat:lat1, lon:lon1} = this.llH.xy2latlon(x, y);
      let {lat:lat2, lon:lon2} = this.llH.xy2latlon(this.lx, this.ly);

      let dlat = lat2-lat1;
      let dlon = lon2-lon1;

      //this.setState({dbg: dlat + ' | ' + dlon});

      this.setState({centerLat: this.state.centerLat+dlat, centerLon: this.state.centerLon+dlon})
      this.fireRegionChange();
    }

    this.lx = x;
    this.ly = y;
  }







}
