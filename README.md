# Easy React-Native Map-Component
## react-native-simplemaps

*** THIS COMPONENT IS A DRAFT - IF YOU LIKE TO USE IT: PLEASE IMROVE IT***

This Component does not use any native Code.
It simply renders map tiles from a tile server onto a View.

You can pan the map via touch, zoom via buttons. No touch zoom supported yet.

You can set an array of markers that will be shown on the map and can be pressed.

## Components

### MapView

#### Example

```JSX
<MapView
  ref={ch => { this.map = ch }}

  style={{flex:1}}

  markers={[
    {
      lat:marker.lat,
      lon:marker.lon,
      color:'red',    // use default icon
      data: marker_data
    },
    {
      lat:48.5643,
      lon:7.2114,
      icon: {
        source:require('./marker-icons/pointto.png'),
        width: 32,
        height: 32,
        pinX:16,
        pinY:16
      },
      data: marker2_data
    },
  ]}

  center={{ lat: 48.09237, lon:  7.96257, }}

  zoom={2}

  getTileUrl={(z,x,y)=>'http://b.tile.openstreetmap.de/tiles/osmde/'+ z + "/"+ x +"/"+ y + '.png'}

  onMarkerPress={this.onMarkerPress}

  onRegionChange={this.onRegionChange}

/>
```
