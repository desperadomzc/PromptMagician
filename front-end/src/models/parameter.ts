import {Dispatch} from "../store";

export interface parameterData {
    promptData: string;
    negativePromptData: string;
    selectModelData: string;
    guidanceScaleData: [number, number];
    randomSeedData: number;
    imageUrlData: string;
}

const initialState: parameterData = {
    promptData: "",
    negativePromptData: "",
    selectModelData: "canny",
    guidanceScaleData: [0, 50],
    randomSeedData: 0,
    imageUrlData: ""
};

const parameter = {
    state: initialState,

    reducers: {
        updateParameterState(
            state: parameterData,
            payload: Partial<parameterData>
        ) {
            return {
                ...state,
                ...payload,
            };
        },
    },

    effects: (dispatch: Dispatch) => ({}),
};

export default parameter;
