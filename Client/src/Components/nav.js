import React, { useState, useEffect, useContext, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import '../App.css';
import { Nav, Navbar, Modal } from 'react-bootstrap'
import RegistrationModal from './RegistrationModal/RegistrationModal'
import SearchForHospitalNames from './SearchForHospitalNames/SearchForHostpitalNames'
import { ValidSessionContext } from '../Context/ValidSessionContext';
import LoginModal from './LoginForm/LoginModal'

const AppNavbar = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [loginModalShow, setLoginModalShow] = useState(false)
  const [hospitalList, setHospitalList] = useState(null)
  const [hospitalSearch, setHospitalSearch] = useState("")
  const [hospitalModal, setHospitalModal] = useState(false);
  const [userIsAuthenticated, setAuthenticated] = useState(null)
  const handleSearchChange = name => setHospitalSearch(name);
  mapboxgl.accessToken = 'pk.eyJ1IjoiZm9nczk2IiwiYSI6ImNrODZscmx2ajA4MTUzam5oNmxqZWIwYTcifQ.YOo54ZuxuHWS2l-zvAsNYA';

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">U.S. Hospital Supply Inventory</Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {!userIsAuthenticated && (
              <Nav.Link onClick={() => setLoginModalShow(true)}>Login</Nav.Link>)}
          </Nav>
          {userIsAuthenticated && (
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
    </div>
  );
}

export default AppNavbar;