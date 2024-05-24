import {ChangeEvent, useEffect, useState} from "react";
import styles from "./index.module.scss";
import {Input, Slider, Modal, Select, Image, message} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../store";
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {image} from "d3";

const {TextArea} = Input;

const ParameterConfigration = () => {
    const [currentImageUrl, setCurrentImageUrl] = useState<string>();
    const {imageUrlData, selectModelData, negativePromptData, promptData, guidanceScaleData, randomSeedData} =
        useSelector((state: RootState) => {
            return state.parameter;
        });
    const {updateParameterState} = useDispatch<Dispatch>().parameter;
    const {updateImageBrowserState} = useDispatch<Dispatch>().imageBrowser;
    const [currentPrompt, setCurrentPrompt] = useState<string>("");
    const [currentNegativePrompt, setCurrentNegativePrompt] = useState<string>("");
    const [currentSelectModel, setCurrentSelectModel] = useState<string>("");
    const [currentGuidanceScale, setCurrentGuidanceScale] = useState<
        [number, number]
    >([0, 0]);
    const [currentRandomSeed, setCurrentRandomSeed] = useState<number>(0);
    const {GetImageArr} = useDispatch<Dispatch>().imageBrowser;

    const generateClick = () => {
        if (currentPrompt === "") {
            error();
            return
        }
        if (!currentImageUrl || currentImageUrl === '') {
            message.error('Please upload origin image for contolNet model')
            return
        }
        updateImageBrowserState({isShowOverlay: true, selectedImage: []});
        updateParameterState({
            promptData: currentPrompt,
            negativePromptData: currentNegativePrompt,
            selectModelData: currentSelectModel,
            guidanceScaleData: currentGuidanceScale,
            randomSeedData: currentRandomSeed,
            imageUrlData: currentImageUrl
        });
        GetImageArr({
            promptData: currentPrompt,
            negativePromptData: currentNegativePrompt,
            selectModelData: currentSelectModel,
            guidanceScaleData: currentGuidanceScale,
            randomSeedData: currentRandomSeed,
            imageUrlData: currentImageUrl,
        })
    };

    const error = () => {
        message.error("Prompt is empty!");
    };

    useEffect(() => {
        setCurrentPrompt(promptData);
        setCurrentImageUrl(imageUrlData);
        setCurrentNegativePrompt(negativePromptData);
        setCurrentSelectModel(selectModelData);
        setCurrentGuidanceScale(guidanceScaleData);
        setCurrentRandomSeed(randomSeedData);
    }, [promptData, guidanceScaleData, randomSeedData, negativePromptData, selectModelData]);

    const promptOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentPrompt(e.target.value);
    };
    const negativePromptOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentNegativePrompt(e.target.value);
    };

    const modelSelectOnchange = (e: string) => {
        setCurrentSelectModel(e);
    };

    const imageUrlOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentImageUrl(e.target.value);
    };
    const sliderOnChange = (e: number[]) => {
        setCurrentGuidanceScale([e[0], e[1]]);
    };
    const randomSeedOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentRandomSeed(Number(e.target.value));
    };

    const imageUrlInputField = (
        <div>
            <Input
                onChange={imageUrlOnChange}
                value={currentImageUrl}
                placeholder="Original Image Url"
                className={styles["prompt-textarea"]}
            />
            <Image
                className={styles["select-model-image-img"]}
                src={currentImageUrl}
                fallback="data:image/png;base64,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"
            />
        </div>
    )

    return (
        <div className={styles["parameter-configration-panel"]}>
            <div className={styles["title"]}>Model Input</div>
            <div className={styles["prompt"]}>
                <div className={styles["prompt-title"]}>Prompt</div>
                <TextArea
                    rows={3}
                    onChange={promptOnChange}
                    value={currentPrompt}
                    placeholder="Prompt"
                    className={styles["prompt-textarea"]}
                />
                <TextArea
                    rows={1}
                    onChange={negativePromptOnChange}
                    value={currentNegativePrompt}
                    placeholder="Negative prompt (optional)"
                    className={styles["prompt-textarea"]}
                />
            </div>
            <div className={styles["select-model"]}>
                <div className={styles["select-model-title"]}>Select Model</div>
                <Select
                    className={styles["select-model-select"]}
                    onChange={modelSelectOnchange}
                    value={currentSelectModel}
                    options={[
                        {value: 'canny', label: 'Canny'},
                        {value: 'depth', label: 'Depth'},
                        {value: 'scribbles', label: 'Scribbles'},
                        {value: 'openpose', label: 'Open Pose'},
                    ]}
                />
                <div className={styles["select-model-image"]}>
                    {currentSelectModel != 'canny' ? null : imageUrlInputField}
                </div>
            </div>
            <div className={styles["guidance-scale"]}>
                <div className={styles["guidance-scale-title"]}>Guidance Scale</div>
                <Slider
                    className={styles["guidance-scale-slider"]}
                    range
                    max={50}
                    min={0}
                    step={1}
                    marks={{0: "0", 50: "50"}}
                    value={currentGuidanceScale}
                    onChange={sliderOnChange}
                />
                <div className={styles["guidance-scale-hint"]}>
                    Current Value: {currentGuidanceScale[0]}~{currentGuidanceScale[1]}
                </div>
            </div>
            <div className={styles["random-seed"]}>
                <div className={styles["random-seed-title"]}>
                    <div className={styles["random-seed-title-text"]}>
                        Total Generation
                    </div>
                    <div className={styles["random-seed-title-hint"]}>
                        (About: {Math.ceil(currentRandomSeed / 56) * 20 + 10}s)
                    </div>
                </div>
                <div className={styles["random-seed-generation"]}>
                    <Input value={currentRandomSeed} onChange={randomSeedOnChange}/>
                    <button
                        className={styles["random-seed-button"]}
                        onClick={generateClick}
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ParameterConfigration;
