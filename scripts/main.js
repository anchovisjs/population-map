      
var {DeckGL, GeoJsonLayer, HexagonLayer, _GlobeView, SimpleMeshLayer, H3ClusterLayer} = deck;
var DATA = './data/pop_points_res1.csv'; 
var c10 = 1000000; 
var c20 = 500000;
var c30 = 100000; 
var c40 = 50000;
var c50 = 10000;
var OPTIONS = ['resolution'];
var COUNTRIES = './data/ne_50m_admin_0_countries.geojson'
const EARTH_RADIUS_METERS = 6.3e6;
const COLOR_RANGE = [
  [181, 228, 140],
  [153, 217, 140],
  [118, 200, 147],
  [82, 182, 154],
  [52, 160, 164],
  [22, 138, 173],
];

function getcolor (d, c1, c2, c3, c4, c5) { 
    if (d.count > c1) {
      return COLOR_RANGE[0];
    }
    else if (d.count > c2) {
      return COLOR_RANGE[1];
    } 
    else if (d.count > c3) {
      return COLOR_RANGE[2];
    }
    else if (d.count > c4) {
      return COLOR_RANGE[3];
    } 
    else if (d.count > c5) {
      return COLOR_RANGE[4];
    } else {
      return COLOR_RANGE[5];
  };
};

function getval (d) {
    var ctr = document.getElementById("counter")
    ctr.innerHTML = Math.round(Number(d.count), 2)  ;
    return Number(d.count)
};

function render (DATA, c1, c2, c3, c4, c5) {
  return new deck.H3HexagonLayer({
      id: 'H3HexagonLayer',
      data: d3.csv(DATA),
      elevationScale: 20,
      extruded: true,
      filled: true,
      getFillColor: d => getcolor (d, c1, c2, c3, c4, c5),
      getHexagon: d => d.hex,
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      stroked: true,
      wireframe: false,
      opacity: 1,
      pickable: true,
      onClick: d => console.log(getval(d.object)),
      autoHighlight: true,
      highlightColor: [255, 218, 112],
    }); 
  
};

let globe = new deck.SimpleMeshLayer({
    id: 'earth-sphere',
    data: [0],
    mesh: new luma.SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
    coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
    getPosition: [0, 0, 0],
    getColor: [0, 49, 82] 
  });

let countries = new deck.GeoJsonLayer({
    id: 'earth-land-layer',
    data: COUNTRIES,
    stroked: false,
    filled: true,
    opacity: 0.3,
    getFillColor: [71, 72, 74]
  });

let mydeckgl = new DeckGL({
  views: new _GlobeView(),
  initialViewState: {
    longitude: 55,
    latitude: 37,
    zoom: 0,
  },
  mapStyle: {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#111' }
      }
    ]
  },
  controller: true, 
layers: [globe, countries, render(DATA, 15000000, 7500000, 1500000, 750000, 150000)],
});

const range = document.getElementById("range");

range.addEventListener("change", () => {
    const val = parseInt(range.value);
    document.getElementById("rangetext").innerText = val;
    var value = Number(val);
    var size =  Math.round(Math.sqrt((2 * Math.round(h3.getHexagonAreaAvg(value, 'km2'), 1)) / (3 * Math.sqrt(3))), 1);
    document.getElementById('size').innerHTML = size;   
        
    if (value > 4) {
      var c1 = Math.round(c10 / (0.25 * Math.abs(4 - value)));
      var c2 = Math.round(c20 / (0.25 * Math.abs(4 - value)));
      var c3 = Math.round(c30 / (0.25 * Math.abs(4 - value)));
      var c4 = Math.round(c40 / (0.25 * Math.abs(4 - value)));
      var c5 = Math.round(c50 / (0.25 * Math.abs(4 - value)));
    } else {
      var c1 = c10 * (5 * (4 - value));
      var c2 = c20 * (5 * (4 - value));
      var c3 = c30 * (5 * (4 - value));
      var c4 = c40 * (5 * (4 - value));
      var c5 = c50 * (5 * (4 - value));
    };
        
    if (value == 4) {
        var c1 = c10;
        var c2 = c20;
        var c3 = c30;
        var c4 = c40;
        var c5 = c50;
    };
        
        document.getElementById('c1').innerHTML = ' > ' + String(c1) + ' человек на ячейку';  
        document.getElementById('c2').innerHTML = ' > ' + String(c2) + ' человек на ячейку';  
        document.getElementById('c3').innerHTML = ' > ' + String(c3) + ' человек на ячейку';  
        document.getElementById('c4').innerHTML = ' > ' + String(c4) + ' человек на ячейку';  
        document.getElementById('c5').innerHTML = ' > ' + String(c5) + ' человек на ячейку';  
        document.getElementById('c6').innerHTML = ' < ' + String(c5) + ' человек на ячейку';  
        
    DATA = './data/pop_points_res'+ String(value) + '.csv';
    mydeckgl.setProps({ 
        layers: [globe, countries, render(DATA, c1, c2, c3, c4, c5)],
    });
});


const changeEvent = new Event("change");
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
let pause
const play = async () => {
    pause = false
    document.getElementById("play").style.display = "none"
    document.getElementById("pause").style.display = "block"
    range.disabled = true
    for (let i = range.value; i < 6; i++) {
        if (pause) {
          break
        }
        range.value = i;
        range.dispatchEvent(changeEvent);
        await timer(1500); 
      }
    range.disabled = false
    document.getElementById("play").style.display = "block"
    document.getElementById("pause").style.display = "none"
    };

document.getElementById("play").addEventListener("click", play);
document.getElementById("pause").addEventListener("click", () => pause = true);

document.getElementById('size').innerHTML = 484;   
document.getElementById("rangetext").innerText = 1;
document.getElementById('c1').innerHTML = ' > 15000000 человек на ячейку';  
document.getElementById('c2').innerHTML = ' > 7500000 человек на ячейку';  
document.getElementById('c3').innerHTML = ' > 1500000 человек на ячейку';  
document.getElementById('c4').innerHTML = ' > 750000 человек на ячейку';  
document.getElementById('c5').innerHTML = ' > 150000 человек на ячейку';  
document.getElementById('c6').innerHTML = ' < 150000 человек на ячейку';  
