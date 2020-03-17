import React from 'react';
import { GameButton } from '../Helpers/GameButton';
import { startAnimationLoop, safeHandler } from '/imports/utils/Common.utils';
import { QuickAlertContext } from "../QuickAlertContext";
import { InjectContext } from '/imports/utils/React.utils';

interface PictureTackerState {
    mediaStream: MediaStream,
    isPhotoTacken: boolean
}

interface PictureTackerProps {
    quickAlert?: (text: string) => void,
    onDone?: () => void
}

@InjectContext({quickAlert: QuickAlertContext})
export class PictureTacker extends React.Component<PictureTackerProps, PictureTackerState>{

    state: PictureTackerState = {
        mediaStream: null,
        isPhotoTacken: false
    }

    videoElement: HTMLVideoElement = null;
    canvasElement: HTMLCanvasElement = null;
    canvasContext: CanvasRenderingContext2D = null;

    componentDidMount() {
        this.requestCameraSource();
    }

    async requestCameraSource() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            this.setState({
                mediaStream
            });
        } catch(err) {
            this.props.quickAlert('Немає доступу до камери');
            safeHandler(this.props.onDone)();
        }
    }


    private readonly handleVideoElementRef = (videoElement: HTMLVideoElement) => {
        const mediaStream = this.state.mediaStream;
        if (videoElement) {
            videoElement.srcObject = mediaStream;
            videoElement.play();
            this.videoElement = videoElement;
            startAnimationLoop(this.processVideoStream)
        }
    }

    private readonly handleCanvasElRef = (canvasElement: HTMLCanvasElement) => {
        this.canvasElement = canvasElement;
    }

    private processVideoStream = () => {
        const canvas = this.canvasElement;
        if (canvas) {
            if (!this.canvasContext) {
                this.canvasContext = canvas.getContext('2d');
            }
            const ctx = this.canvasContext;
            const { width, height } = this.videoElement.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(this.videoElement, 0, 0, width, height);

        }

    }



    private readonly takePicture = () => {
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
                        <React.Fragment>
                            <video ref={this.handleVideoElementRef} />
                            <canvas ref={this.handleCanvasElRef} />
                        </React.Fragment>
                    )}
                </div>

                {!isPhotoTacken && (
                    <div id="take-picture-wrapper">
                        <GameButton onClick={this.takePicture}>
                            <i className="fas fa-camera" />
                        </GameButton>
                    </div>
                )}
            </React.Fragment>
        )
    }

}