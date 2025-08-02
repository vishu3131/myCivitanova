'use client'
import { useRive } from '@rive-app/react-canvas'

export default function AnimatedIcon() {
  const { RiveComponent } = useRive({
    src: "/animations/heart.riv", // file esportato dal Rive editor
    autoplay: true,
    stateMachines: ['State Machine 1']
  });

  return (
    <div className="w-20 h-20">
      <RiveComponent className="w-full h-full" />
    </div>
  )
}