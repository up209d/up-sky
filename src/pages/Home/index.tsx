import styled from 'styled-components';
import CanvasAnimation from './canvas.ts';
import {useEffect, useState} from 'react';

export const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

export const Canvas = styled.canvas`
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
`;

export const Title = styled.h1`
  font-size: calc(100vw / 30);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.25);
  font-weight: 100;
`;

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const canvasAnimation = new CanvasAnimation({
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: 1,
            fps: 60,
            step: 1 / 60,
        });
        canvasAnimation.init().then(() => setIsLoading(false));
        const resizeHandler = () => {
            canvasAnimation.updateSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
            if (canvasAnimation) {
                canvasAnimation.destroy();
            }
        };
    }, []);
    return (
        <Wrapper>
            <Canvas id={`renderer`} width={window.innerWidth} height={window.innerHeight} />
            <Title>{isLoading ? 'LOADING...' : 'UP Canvas Sky - Pseudo 3D Environment'}</Title>
        </Wrapper>
    );
}
