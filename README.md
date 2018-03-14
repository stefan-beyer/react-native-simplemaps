# Easy React-Native Map-Component
## react-native-simplemaps

## Components

### MapView

#### Example

```
<MapView
  ref={ch => { this.map = ch }}
  style={{flex:1}}

  markers={[
    {
      lat:marker.lat,
      lon:marker.lon,
      color:'red',
      data: marker
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
      data: marker2
    },
  ]}

  center={{ lat: 48.09237, lon:  7.96257, }}

  zoom={2}

  getTileUrl={(z,x,y)=>'http://b.tile.openstreetmap.de/tiles/osmde/'+ z + "/"+ x +"/"+ y + '.png'}

  onMarkerPress={this.onMarkerPress}

  onRegionChange={this.onRegionChange}

/>
```
