import React, { useState, useEffect, useContext, useRef } from 'react';
import Map from "./Components/map.js";
import AppNavbar from "./Components/nav.js";
import mapboxgl from 'mapbox-gl';
import './App.css';
import hospitals from './hospital.geojson'
import { Nav, Navbar, Modal } from 'react-bootstrap'
import RegistrationModal from './Components/RegistrationModal/RegistrationModal'
import SearchForHospitalNames from './Components/SearchForHospitalNames/SearchForHostpitalNames'
import { ValidSessionContext } from './Context/ValidSessionContext';
import LoginModal from './Components/LoginForm/LoginModal'
import HospitalModal from "./Components/Modals/HospitalModal";

function App() {
  const [modalShow, setModalShow] = useState(false);
  const [loginModalShow, setLoginModalShow] = useState(false)
  const [hospitalList, setHospitalList] = useState(null)
  const [hospitalSearch, setHospitalSearch] = useState("")
  const [hospitalModal, setHospitalModal] = useState(false);
  const [userIsAuthenticated, setAuthenticated] = useState(null)
  const [didMount, setDidMount] = useState(false)
  const handleSearchChange = name => setHospitalSearch(name);
  const handleCloseHospitalModal = () => setHospitalModal(false);
  mapboxgl.accessToken = 'pk.eyJ1IjoiZm9nczk2IiwiYSI6ImNrODZscmx2ajA4MTUzam5oNmxqZWIwYTcifQ.YOo54ZuxuHWS2l-zvAsNYA';
  const getHospitalsEndpoint = "/api/register";
  const { userAuth } = useContext(ValidSessionContext)
  const getHospitaloptions = {
    method: "GET"
  }
  // Setting didMount to true upon mounting
  useEffect(() => setDidMount(true), [])

  useEffect(() => {

    async function isAuth() {
      const auth = await userAuth();
      setAuthenticated(auth)
      if (auth == true) {
        setHospitalModal(true);
      } else {
        setHospitalModal(false)
      }
    }
    // Execute the created function directly
    isAuth();
  }, [loginModalShow])

  useEffect(() => {

    const fetchHospitals = () => {
      fetch(getHospitalsEndpoint, getHospitaloptions)
        .then(result =>
          result.json()).catch(function (error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
          }).
        then(data => {
          setHospitalList(data)
        })
    };
    fetchHospitals();
  }, [])
  return (
    <div>
      <AppNavbar />
      <Modal className="modal-background" size="xl" show={hospitalModal} onHide={handleCloseHospitalModal}>
        <HospitalModal hospitalName={hospitalSearch}> </HospitalModal>
      </Modal>
      <Map></Map>
      <div class='map-overlay' id='legend'></div>
    </div>
  );
}

export default App;
