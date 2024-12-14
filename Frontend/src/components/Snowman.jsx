import React, { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useSpeechSynthesis } from 'react-speech-kit'
import SpeechRecognition , { useSpeechRecognition } from 'react-speech-recognition'
import axios from 'axios'
// import reducer from './speechReducer'
import { useContext } from 'react';
import { UserContext } from '../contexts/user.context';


export default function Snowman(props) {
  const initialState = {text: ""}
  // const [state, dispatch] = useReducer(reducer, initialState)
  const { transcript, resetTranscript } = useSpeechRecognition()
  const [talk, setTalk] = useState(true)
  const [listen, setListen] = useState(false)
  const mouthRef = useRef()
  // let {speak} = useSpeechSynthesis()
  
  const { user } = useContext(UserContext);

    // speak({text: response.data})
    // speech to text recognition
    function handleListen() {
        if (listen) {
            console.log("Transcript: ", transcript)
            console.log("user ", user)
            console.log("user ", user._profile.data.email)

            if (transcript != "") {
              axios.post('http://10.3.40.213:8080/interact_with_teacher/', {"param1": transcript, "email": user._profile.data.email}, {
                  headers: {
                      'Content-Type': 'application/json'
                  }
              })
              .then(response => props.setSpeechText(response.data.result))
              .catch(error => console.error('Error:', error));
          } 

            SpeechRecognition.stopListening()
            resetTranscript()
            setListen(false)
        } else {
            SpeechRecognition.startListening()
            setListen(true)
        }
      }
    
    useEffect(()=>{
      setTalk(!talk)
    }, [transcript])
    
  return (
    <group {...props}>
        <mesh
      scale={1}
      position={[0,0,0.5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'hotpink'} />
    </mesh>
    <mesh position={[0,0,1.5]} onClick={(e)=> {
        // handleListen()
        }}>
        <sphereGeometry args={[0.5,32,16]}/>
        <meshStandardMaterial color={listen? 'green' : 'white'}/>
    </mesh>
    <mesh position={[0.15,0.5,1.5]}>
        <sphereGeometry args={[0.03,32,16]}/>
        <meshStandardMaterial color={'black'}/>
    </mesh>
    <mesh position={[-0.15,0.5,1.5]}>
        <sphereGeometry args={[0.03,32,16]}/>
        <meshStandardMaterial color={'black'}/>
    </mesh>
    <mesh position= {talk ? [0,0.5,1.35]: [0,0.5, 1.25]}>
        <boxGeometry args={[0.3, 0.01, 0.01]} />
        <meshStandardMaterial color={'black'}/>
    </mesh>
    
    </group>
  )
}
