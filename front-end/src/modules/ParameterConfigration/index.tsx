import {ChangeEvent, useEffect, useState} from "react";
import styles from "./index.module.scss";
import {Input, Slider, Modal, Select, Upload, message} from "antd";
import type {GetProp, UploadProps} from 'antd';
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../store";
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {image} from "d3";

const {TextArea} = Input;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //     message.error('Image must smaller than 2MB!');
    // }
    return isJpgOrPng
    // && isLt2M;
};

const ParameterConfigration = () => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const {selectModelData, negativePromptData, promptData, guidanceScaleData, randomSeedData} =
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
        if (!imageUrl || imageUrl === '') {
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
        });
        GetImageArr({
            promptData: currentPrompt,
            negativePromptData: currentNegativePrompt,
            selectModelData: currentSelectModel,
            guidanceScaleData: currentGuidanceScale,
            randomSeedData: currentRandomSeed,
        })
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as FileType, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };

    const uploadButton = (
        <button style={{border: 0, background: 'none'}} type="button">
            {loading ? <LoadingOutlined/> : <PlusOutlined/>}
            <div style={{marginTop: 8}}>Upload</div>
        </button>
    );

    const error = () => {
        message.error("Prompt is empty!");
    };

    useEffect(() => {
        setCurrentPrompt(promptData);
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
    const sliderOnChange = (e: number[]) => {
        setCurrentGuidanceScale([e[0], e[1]]);
    };
    const randomSeedOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentRandomSeed(Number(e.target.value));
    };

    const selectModelImageUpload = (
        <Upload
            name="image"
            listType="picture-card"
            style={{height: '100%'}}
            showUploadList={false}
            action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            {imageUrl ? <img src={imageUrl} style={{width: '100%'}}/> : uploadButton}
        </Upload>
        // <Image
        //     width={200}
        //     src="https://hf.co/datasets/huggingface/documentation-images/resolve/main/diffusers/input_image_vermeer.png"
        // />
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
                        {value: 'deep', label: 'Deep'},
                        {value: 'scribbles', label: 'Scribbles'},
                        {value: 'humanPose', label: 'Human Pose'},
                    ]}
                />
                <div className={styles["select-model-image"]}>
                    {currentSelectModel != 'canny' ? null : selectModelImageUpload}
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
