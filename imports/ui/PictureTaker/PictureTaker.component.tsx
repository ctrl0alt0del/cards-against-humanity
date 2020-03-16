import React from 'react';
import { GameButton } from '../Helpers/GameButton';

interface PictureTackerState {
    mediaStream: MediaStream,
    isPhotoTacken: boolean
}


export class PictureTacker extends React.Component<{}, PictureTackerState>{

    state: PictureTackerState = {
        mediaStream: null,
        isPhotoTacken: false
    }

    videoElement: HTMLVideoElement = null;
    photoWidth: number = 0;
    photoHeight: number = 0;

    componentDidMount() {
        this.requestCameraSource();
    }

    async requestCameraSource() {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        this.setState({
            mediaStream
        })
    }


    private readonly handleVideoElementRef = (videoElement: HTMLVideoElement) => {
        const mediaStream = this.state.mediaStream;
        if (videoElement) {
            videoElement.srcObject = mediaStream;
            videoElement.play();
            this.videoElement = videoElement;
        }
    }

    private readonly handleCanvasElRef = (canvasElement: HTMLCanvasElement) => {
        if (canvasElement && this.videoElement) {
            const canvasCtx = canvasElement.getContext('2d');
            canvasElement.width = this.photoWidth;
            canvasElement.height = this.photoHeight;
            canvasCtx.drawImage(this.videoElement, 0, 0, this.photoWidth, this.photoHeight);
        }
    }

    private readonly takePicure = () => {
        const { width, height } = this.videoElement.getBoundingClientRect();
        this.photoHeight = height;
        this.photoWidth = width;
        this.setState({
            isPhotoTacken: true
        })
    }

    render() {
        const { mediaStream, isPhotoTacken } = this.state;
        return (
            <React.Fragment>
                <div className="picture-tacker-wrapper">
                    {mediaStream && (
                        !isPhotoTacken ? (
                            <video ref={this.handleVideoElementRef} />
                        ) : (
                                <canvas ref={this.handleCanvasElRef} />
                            )
                    )}
                </div>

                {!isPhotoTacken && (
                    <div id="take-picture-wrapper">
                        <GameButton onClick={this.takePicure}>
                            <i className="fas fa-camera" />
                        </GameButton>
                    </div>
                )}
            </React.Fragment>
        )
    }

}