import styled from 'styled-components';
import CanvasAnimation from './canvas.ts';
import { useEffect } from 'react';

export const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;
export default function Home() {
    useEffect(() => {
        const canvasAnimation = new CanvasAnimation({
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: 1,
            fps: 60,
            step: 1 / 60,
        });
        canvasAnimation.init();
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
            <canvas id={`renderer`} width={window.innerWidth} height={window.innerHeight} />
        </Wrapper>
    );
}
