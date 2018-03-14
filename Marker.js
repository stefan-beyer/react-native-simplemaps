import React, { Component } from 'react';


import {
  Image,
  TouchableOpacity
} from 'react-native';




export function Marker(props) {
  let icon = props.icon;
  if (typeof icon == 'undefined') {
    let color = props.color || 'black';
    icon = {
      source: ({
        black: {uri:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAB+0lEQVRIS6XVy8tOURTH8c+r5JokQ5KilJTcBpSJCQaGyqVkQBiQ23/hlvISAyXEUHIbKURyGyGFcpmi3JnQqnX0OD372Uf27Jy19u+71l57rzVk8BrCCqzFYkzBL7zFbZzB1UESIVBas3ESCytB3MVGPO3nVwIswwWMq4g35s9Yhett/36AiDyiasS/4QjO4kkKhM86bMPo/BeQRe1M2oD4DvHmWF5jeSl9BOgKpibkTtbqTyJtwEpcSmtEPn+AeCMSkAcYlT8ioGuNsQ04namHfR/2dqzBAexM31PYUAK8xPQ0zsOjjoDI9H76vsCMEuAnRqYxivejI2AMvqZv7GkKr31EnzD+PwGhMaGUwS0sSWOk/bBjBgtwL31vYmkJsAv70xiF290RcAg70jc0DpYAk/EKY/EdEdnjCmRORh/X9Aum4V0JEP8jg4gi1ptsdiVIiF/OJtjs3dMbUL9WMQlx1SamY2RyNDtnb6tYjy09D+xDXs/3NUDYt2K44/k3brHnWHtPqZuOwI2eG1Vjxe2LmxOz4q81aB7MzJdca9lR2Ll43i+KQYDw34TjlfA340TJpwaIfeexuiBwDmsGBdAFEK0jXumsllCMyBgwMWiKqwsgNod4DKKmx3xM8We16ncFhE4Mo4t5U2L+xgOrrn8BhNj2VDxcVU6H3yU+XBnTY6+fAAAAAElFTkSuQmCC"},
        green: require('./marker-icons/marker-green.png'),
        blue:  require('./marker-icons/marker-blue.png'),
        red:   require('./marker-icons/marker-red.png'),
      })[color],
      pinX: 12,
      pinY: 23,
      width: 24,
      height: 24
    };
  }



  return (
    <TouchableOpacity style={{position:'absolute', width:icon.width, height:icon.height, top:props.y-icon.pinY, left:props.x-icon.pinX}} onPress={props.onPress ? ()=>props.onPress(props.data) : null}>
      <Image style={{width:icon.width, height:icon.height}} source={icon.source}/>
    </TouchableOpacity>
  );
}
