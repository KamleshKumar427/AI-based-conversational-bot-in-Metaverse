import React from 'react'
import { useTexture } from '@react-three/drei'

export default function Plane() {
    const terrainTextures = useTexture({
        map: "./textures_plane/rock_wall_06_diff_1k.jpg",
    })
    return (
		<mesh position={[0, 0, 0]}>
			<planeGeometry args={[25, 25]} />
			<meshStandardMaterial {...terrainTextures}/>
		</mesh>
	)
}
