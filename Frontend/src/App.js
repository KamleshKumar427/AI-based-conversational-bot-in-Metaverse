// Code with react-Xr moves to 3d.

import './App.css';
import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MapControls, Sky, Stars, OrbitControls } from '@react-three/drei';
import { VRButton, XR, Controllers, useXR, Interactive } from '@react-three/xr';  
import { Camera, PerspectiveCamera } from 'three';
import { UserContext } from './contexts/user.context';
import { useContext } from 'react';
import { Button } from '@mui/material'
import axios from 'axios';

// Login setup
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/user.context";
import Home from "./pages/Home.page";
import Login from "./pages/Login.page";
import PrivateRoute from "./pages/PrivateRoute.page";
import Signup from "./pages/Signup.page";

// import Learner from './components/Learner';
import Plane from './components/Plane';
import Snowman from './components/Snowman';
import SnowmanTutor from './components/SnowmanTutor';
import Teacher from './components/Teacher';
import Student from './components/Student'
import BusinessMan from './components/BusinessMan'
// import { Controllers, useXR } from "@react-three/xr"
// import { useEffect } from "react"

function ControllersRig({ position }) {
  const { isPresenting, player } = useXR()

  useEffect(() => {
    if (isPresenting) {
      player.position.x = position.x
      player.position.y = position.y
      player.position.z = position.z

      player.rotateX(-0.9)
      player.rotateY(-0.1) 
      player.rotateZ(2.87)
    }
  }, [isPresenting, position])

  return <Controllers  rayMaterial={{ color: "red" }} />
}
function HomePage(props) {
  // console.log("in HomePage", props._teacherActions)
  const [speechText, setSpeechText] = useState("")

  const [superSetListen, setsuperSetListen] = useState(null);
  const [mainListen, setmainListen] = useState(false);
  
  const gltf = useLoader(GLTFLoader, '/businessMan.gltf')
  const gltfClass = useLoader(GLTFLoader, '/scene.gltf')
  const mixerRef = useRef();

  const [isInVRMode, setIsInVRMode] = useState(false);


  // # XR corrdinates [12, -6, 20.8] [0,1, 1.5]
  // [2, -20.49, 22.8]  [0.99, 0.23, -0.11]
  // position: [19,-8, 28]
  const { logOutUser } = useContext(UserContext);
 
  // This function is called when the user clicks the "Logout" button.
  const logOut = async () => {
    try {
      const loggedOut = await logOutUser();
      if (loggedOut) {
        window.location.reload(true);
      }
    } catch (error) {
      alert(error)
    }
  }

  function sendLogToBackend(message) {
      // console.log(message);
      axios.post('http://10.3.40.213:8080/log_message/', {
          message: message
      }, {
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(response => {
          console.log('Log sent to backend:', response.data);
      }).catch(error => {
          console.error('Failed to send log to backend:', error);
      });
  }

  return (
    <>
    {/* <Button variant="contained" onClick={logOut} style={{ position: 'absolute', zIndex: 1000, top: 10, left: 10 }}>LogOut</Button> */}
    <Button 
        variant="contained"
        onClick={logOut}
        style={{
          position: 'absolute',
          zIndex: 1000,
          top: 10,
          left: 10,
          color: 'black', // Set text color
          backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent background
          backdropFilter: 'blur(5px)' // Optional: apply blur to the background behind the button
          
        }}> LogOut </Button>

    <VRButton   />
    <Canvas camera={{ position: [-2.2,1.6, 1.8],  up: [0, 0, 1], far: 10000, fov:70 }} style={{ position: 'absolute', width: '100%', height: '100%' }}>

    <XR referenceSpace="local-floor" frameRate={10} >
      {/* <Controllers />   */}
      <ControllersRig position={{x:2.1, y:-0.1, z:1.28}}/>

      <mesh>
        <Suspense fallback={null}>
        <Sky
            distance={45}
            // sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
          />
        <Stars
            radius={200} // Radius of the inner sphere (default=100)
            depth={100} // Depth of area where stars should fit (default=50)
            count={5000} // Amount of stars (default=5000)
            factor={10} // Size factor (default=4)
            saturation={0} // Saturation 0-1 (default=0)
            fade // Faded dots (default=false)
          />
          <ambientLight intensity={0.75} />
          <directionalLight color="red"/>
          <Teacher rotation={[Math.PI/2, -1750, 0]} position={[-0.2, -3.8,0]} scale={0.85} speechText={speechText} teacherActions = {props._teacherActions}  setTeacherActions = {props._setTeacherActions}></Teacher>
          <primitive object={gltfClass.scene} scale ={0.009} rotation={[Math.PI/2, 0, 0]}/>
          <Interactive onSelectStart={(event) => {
            // console.log("Here it is");
            // event.stopPropagation();  // To stop multiple events at same time
            superSetListen();
        }}>
            <BusinessMan mainListen = {mainListen} setmainListen = {setmainListen} sendLogToBackend = {sendLogToBackend} rotation={[-Math.PI/2, 1750, Math.PI]} position ={[-0.65,0.0, 0]} scale={1} setSpeechText={setSpeechText} teacherActions= {props._teacherActions} setsuperSetListen = {setsuperSetListen}/>
          </Interactive>
          {/* <Plane></Plane> */}
          <OrbitControls enableDamping dampingFactor={0.05} rotateSpeed={0.1} zoomSpeed={0.3} />
          
          </Suspense>
          </mesh>
          <MapControls />
      </XR>
    </Canvas>
  </>
  );
}

function App() {
  const [teacherActions, setTeacherActions] = useState(null);
  // const [lectureText, setlectureText] = useState("");
  // console.log("Inside APP()" , teacherActions )
  return (

    <BrowserRouter>
    {/* We are wrapping our whole app with UserProvider so that */}
    {/* our user is accessible through out the app from any page*/}
    <UserProvider>
      <Routes>
        <Route exact path="/login" element={<Login _teacherActions= {teacherActions}/>} />
        <Route exact path="/signup" element={<Signup />} />
        {/* We are protecting our Home Page from unauthenticated */}
        {/* users by wrapping it with PrivateRoute here. */}
        <Route element={<PrivateRoute />}>
          <Route exact path="/" element={<HomePage _teacherActions= {teacherActions} _setTeacherActions = {setTeacherActions}/>} />
        </Route>
      </Routes>
    </UserProvider>
  </BrowserRouter>

      );
}

export default App;
