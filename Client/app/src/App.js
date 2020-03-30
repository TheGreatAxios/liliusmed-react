import React, {useState, useEffect, useContext} from 'react';
import mapboxgl from 'mapbox-gl';
import hospitalIcon from './hospitalIcon.png';
import './App.css';
import hospitals from './hospital.geojson'
import {Nav, Navbar, Modal} from 'react-bootstrap'
import RegistrationModal from './Components/RegistrationModal/RegistrationModal'
import SearchForHospitalNames from './Components/SearchForHospitalNames/SearchForHostpitalNames'
import { ValidSessionContext } from './Context/ValidSessionContext';
import LoginModal from './Components/LoginForm/LoginModal'
import HospitalModal from "./Components/Modals/HospitalModal";

function App() {
  const [modalShow, setModalShow] = useState(false);
  const[loginModalShow, setLoginModalShow] = useState(false)
  const [hospitalList, setHospitalList] = useState(null)
  const [hospitalSearch, setHospitalSearch] = useState("")
  const [hospitalModal, setHospitalModal] = useState(false);
  const [userIsAuthenticated, setAuthenticated] = useState(null)
  const [didMount, setDidMount] = useState(false)
  const handleSearchChange = name => setHospitalSearch(name);
  const handleCloseHospitalModal = () => setHospitalModal(false);
  mapboxgl.accessToken = 'pk.eyJ1IjoiZm9nczk2IiwiYSI6ImNrODZscmx2ajA4MTUzam5oNmxqZWIwYTcifQ.YOo54ZuxuHWS2l-zvAsNYA';
  const getHospitalsEndpoint = "/api/register";
  const {userAuth} = useContext(ValidSessionContext)
  const getHospitaloptions = {
    method: "GET",
    
    headers: {
      "Content-Type": "application/json",     
    }
  }
  // Setting didMount to true upon mounting
  useEffect(() => setDidMount(true), [])

  useEffect(() => {

    async function isAuth() {
      const auth = await userAuth();
      setAuthenticated(auth)
    }
    // Execute the created function directly
    isAuth();
  },[loginModalShow])

  useEffect(() => {
    
    const fetchHospitals =  () => {
        fetch(getHospitalsEndpoint, getHospitaloptions)
        .then(result =>
          result.json()).catch(function(error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
          }).
        then(data => 
          {
            setHospitalList(data)
          })  
        };
        fetchHospitals();
},[])
  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">U.S. Hospital Supply Inventory</Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto"> 
            {!userIsAuthenticated  && (
            <Nav.Link onClick={() => setLoginModalShow(true)}>Login</Nav.Link>)}
          </Nav>
          {userIsAuthenticated   && (
              <SearchForHospitalNames value={hospitalSearch} setValue={(hospitalName) => {
                handleSearchChange(hospitalName);
                setHospitalModal(true);
              }} hospitalList={hospitalList} className="mr-sm-2" />
          )}
        </Navbar.Collapse>
      </Navbar>
      <div>
          <RegistrationModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            hospitalList={hospitalList}
            onOpenLogin
          />  
      </div>
      <div>
          <LoginModal
            show={loginModalShow}
            onHide={() => setLoginModalShow(false)}
            onOpenRegistrationModal={() => setModalShow(true)}  
          />  
      </div>
       <Map></Map>          
        <Modal size="modal-90w"show={hospitalModal} onHide={handleCloseHospitalModal}>
          <HospitalModal hospitalName={hospitalSearch}> </HospitalModal>
        </Modal>
    </div>
  );
}

class Map extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      lng: -80.7959,
      lat: 41.3992 ,
      zoom: 3
    };
  }
  
  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/fogs96/ck8dfn26y2vok1jr0wuxy9nhq',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    }
    );
    
    map.on('load', function() {

      const url = 'http://3.15.211.153/api/liliusmed/cases/predicted/geojson';
        window.setInterval(function() {
          map.getSource('newyork').setData(url);
        }, 200000000);
        
        map.addSource('newyork', { type: 'geojson', data: url });
        map.addLayer({
          'id': 'newyork',
          'type': 'fill',
          'source': 'newyork',
          'paint': {
            'fill-color':
            ['case', ['<', ['get', "cases"], 5], '#E3B3A5',
                    ['<', ['get', "cases"], 50], '#E2967E',
                    ['>=', ['get', "cases"], 50], '#E06941', '#EAEAEA'],
            'fill-outline-color': '#bf502b',
            'fill-opacity': 0.5
          }
        });

  // When a click event occurs on a feature in the states layer, open a popup at the
  // location of the click, with description HTML from its properties.

      map.addSource('hospitals', {
        type: 'geojson',
        data: hospitals
      });


      map.loadImage(
        hospitalIcon,
        function(error, image) {
        if (error) throw error;
        map.addImage('hospital', image);
        map.addLayer({
        'id': 'hospital-point',
        'type': 'symbol',
        'source': 'hospitals',
        'layout': {
        'icon-image': 'hospital',
        'icon-ignore-placement': true,
        'icon-size': 0.03
        }
        });
        }
        );
   
      map.on('click', function(e) {
        var ourMapLayers = map.queryRenderedFeatures(e.point, {
          layers: ['countypolygons-0l4xxe', 'newyork', 'hospital-point']
        });
        // console.log(ourMapLayers);
        const hospitalLayer = ourMapLayers.filter(layer => layer.source == "hospitals")[0];
        const newyorkLayer = ourMapLayers.filter(layer => layer.source == "newyork")[0];
        const countyLayer = ourMapLayers.filter(layer => layer.sourceLayer == "countyPolygons-0l4xxe")[0];

        if (hospitalLayer != null) {
          new mapboxgl.Popup()
          .setLngLat(hospitalLayer.geometry.coordinates)
          .setHTML('<b>Hospital Name:</b> ' + hospitalLayer.properties.hospitalName + '\n\n'
           + '<b>Bed Count:</b> ' + hospitalLayer.properties.bedCount)
          .addTo(map);
        } else if (newyorkLayer != null && ourMapLayers.length > 1) {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<h2>${countyLayer.properties.NAME}</h2><span>Predicted Cases Tomorrow: ${newyorkLayer.properties.cases}</span>`)
          .addTo(map);
        }
      });

    });
    map.on('move', () => {
      this.setState({
      lng: map.getCenter().lng.toFixed(4),
      lat: map.getCenter().lat.toFixed(4),
      zoom: map.getZoom().toFixed(2)
        });
      });
  }
  render() {
      return (
        <div>
          <div ref={el => this.mapContainer = el} className="mapContainer" />
        </div>
      )
  }

}
export default App;
