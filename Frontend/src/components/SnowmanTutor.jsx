import React, { useState, useEffect, useReducer } from 'react'
import { useSpeechSynthesis } from 'react-speech-kit'
import { useFrame } from '@react-three/fiber'
// import reducer from './speechReducer'


export default function SnowmanTutor(props) {
    const initialState = {text: ""}
    const [talk, setTalk] = useState(true)
    const [listen, setListen] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [timeCount, setTimeCount] = useState(0)
    // const [state, dispatch] = useReducer(reducer, initialState)
    let {speak} = useSpeechSynthesis()
    
    useEffect(()=>{
      console.log("Response:", (props.speechText))
      speak({text: props.speechText})
      // setTimeCount(0)
    }, [props.speechText])

    // useFrame((state, delta)=>{
    //   setTimeCount(timeCount + 1)
    //   if (timeCount < 6000) {
    //     setTalk(false)
    //   }
    //   else if (timeCount < 120) setTalk(true)
    //   else if (timeCount < 180) setTalk(false)
    //   else if (timeCount < 240) setTalk(true)
    //   else setTalk(false)
    // })

  return (
    <group {...props}>
        <mesh
      scale={1}
      position={[0,0,0.5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'hotpink'} />
    </mesh>
    <mesh position={[0,0,1.5]}>
        <sphereGeometry args={[0.5,32,16]}/>
        <meshStandardMaterial color={listen? 'green' : 'silver'}/>
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
