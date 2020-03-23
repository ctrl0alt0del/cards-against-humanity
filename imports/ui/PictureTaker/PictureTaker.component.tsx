import React from 'react';
import { GameButton } from '../Helpers/GameButton';
import { startAnimationLoop, safeHandler } from '/imports/utils/Common.utils';
import { QuickAlertContext } from "../QuickAlertContext";
import { InjectContext } from '/imports/utils/React.utils';
import { getVideoStreamResolution, applyCanvasImageManipulation, ImageManipulationFunction } from '../../utils/Media.utils';
import { DefaultImageEffect, FishEyeEffect } from './ImageEffects.lib';

export type ImageEffect = {
    name: string,
    effectGenFn: (width: number, height: number) => ImageManipulationFunction
}

interface PictureTackerState {
    mediaStream: MediaStream,
    isPhotoTacken: boolean,
    selectedImageEffect: ImageEffect
}

interface PictureTackerProps {
    quickAlert?: (text: string) => void,
    onDone?: () => void
}

@InjectContext({ quickAlert: QuickAlertContext })
export class PictureTacker extends React.Component<PictureTackerProps, PictureTackerState>{

    state: PictureTackerState = {
        mediaStream: null,
        isPhotoTacken: false,
        selectedImageEffect: DefaultImageEffect
    }

    videoElement: HTMLVideoElement = null;
    canvasElement: HTMLCanvasElement = null;
    canvasContext: CanvasRenderingContext2D = null;

    previewCanvasesData: { canvas: HTMLCanvasElement, effect: ImageEffect, ctx?: CanvasRenderingContext2D }[] = [];

    componentDidMount() {
        this.requestCameraSource();
    }

    async requestCameraSource() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            this.setState({
                mediaStream
            });
        } catch (err) {
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
            startAnimationLoop(() => {
                if (this.canvasElement) {
                    if (!this.canvasContext) {
                        this.canvasContext = this.canvasElement.getContext('2d');
                    }
                    const ctx = this.canvasContext;
                    this.processVideoStream(this.canvasElement, ctx, this.state.selectedImageEffect);
                }
            });
            startAnimationLoop(() => {
                for (const previewCanvasData of this.previewCanvasesData) {
                    if (!previewCanvasData.ctx) {
                        previewCanvasData.ctx = previewCanvasData.canvas.getContext('2d');
                    }
                    const ctx = previewCanvasData.ctx;
                    this.processVideoStream(previewCanvasData.canvas, ctx, previewCanvasData.effect, .5);
                }
            }, 2000)
        }
    }

    private readonly handleCanvasElRef = (canvasElement: HTMLCanvasElement) => {
        this.canvasElement = canvasElement;
    }

    private handlePreviewEffectCanvasElRef(canvasElement: HTMLCanvasElement, effect: ImageEffect) {
        const effectName = effect.name;
        if (canvasElement) {
            this.previewCanvasesData.push({ canvas: canvasElement, effect });
        } else {
            this.previewCanvasesData = this.previewCanvasesData.filter(data => data.effect.name !== effectName);
        }
    }

    private processVideoStream(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, effect: ImageEffect, scale = 1) {
        const stream = this.state.mediaStream;
        let { width, height } = getVideoStreamResolution(stream);
        width *= scale;
        height *= scale;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(this.videoElement, 0, 0, width, height);
        const effectFn = effect.effectGenFn(width, height);
        applyCanvasImageManipulation(ctx, effectFn);

    }



    private readonly takePicture = () => {
        this.setState({
            isPhotoTacken: true
        })
    }

    render() {
        const { mediaStream, isPhotoTacken } = this.state;
        const availableImageEffects = [DefaultImageEffect, FishEyeEffect];
        return (
            <React.Fragment>
                <div className="picture-tacker-wrapper">
                    {mediaStream && (
                        <React.Fragment>
                            <video ref={this.handleVideoElementRef} />
                            <canvas ref={this.handleCanvasElRef} />
                        </React.Fragment>
                    )}
                    <div id="preview-effects-list">
                        {availableImageEffects.map(effect => {
                            return <canvas key={effect.name} ref={ref => this.handlePreviewEffectCanvasElRef(ref, effect)} />
                        })}
                    </div>
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